import { Influencer, User, Order, Payout, ReferralClick } from '../models/index.js';

// Build a referral-code base from a display name (A–Z0–9, max 8 chars).
function codeBase(name) {
  const base = (name || 'JOKER').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  return base || 'JOKER';
}

// Generate a unique referral code (e.g. PRIYA, PRIYA243).
export async function generateReferralCode(name) {
  const base = codeBase(name);
  for (let attempt = 0; attempt < 60; attempt++) {
    const suffix = attempt === 0 ? '' : Math.floor(100 + Math.random() * 900);
    const code = `${base}${suffix}`;
    const exists = await Influencer.findOne({ where: { referralCode: code } });
    if (!exists) return code;
  }
  return `${base}${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

// Commission for one order, given the influencer and the commission base
// (net product subtotal after discount, excl. shipping/tax).
export function computeCommission(influencer, base) {
  const rate = parseFloat(influencer.commissionRate) || 0;
  if (influencer.commissionType === 'fixed') return Math.round(rate * 100) / 100;
  return Math.round(((base * rate) / 100) * 100) / 100;
}

// Resolve which (approved) influencer an order should be attributed to.
// Priority: explicit referral code (link cookie) → coupon's influencerId.
// Returns null when none, not approved, or it's a self-referral.
export async function resolveInfluencer({ referralCode, couponInfluencerId, buyerUserId, buyerEmail }) {
  let inf = null;
  if (referralCode) {
    inf = await Influencer.findOne({
      where: { referralCode: String(referralCode).toUpperCase().trim() },
    });
  }
  if (!inf && couponInfluencerId) inf = await Influencer.findByPk(couponInfluencerId);
  if (!inf || inf.status !== 'approved') return null;

  // Self-referral guard
  if (buyerUserId && inf.userId === buyerUserId) return null;
  if (buyerEmail) {
    const owner = await User.findByPk(inf.userId);
    if (owner?.email && owner.email.toLowerCase() === String(buyerEmail).toLowerCase()) return null;
  }
  return inf;
}

// Aggregate performance numbers for an influencer.
export async function influencerStats(influencerId) {
  const orders = await Order.findAll({
    where: { influencerId },
    attributes: ['totalAmount', 'commissionAmount', 'commissionStatus'],
  });
  const sum = (rows, f) => rows.reduce((a, r) => a + (parseFloat(r[f]) || 0), 0);
  const byStatus = (s) => orders.filter((o) => o.commissionStatus === s);

  const totalSales = sum(orders, 'totalAmount');
  const pending = sum(byStatus('pending'), 'commissionAmount');
  const approved = sum(byStatus('approved'), 'commissionAmount');
  const paidCommission = sum(byStatus('paid'), 'commissionAmount');
  const paidOut = (await Payout.sum('amount', { where: { influencerId, status: 'paid' } })) || 0;
  const clicks = await ReferralClick.count({ where: { influencerId } });

  const round = (n) => Math.round(n * 100) / 100;
  return {
    clicks,
    orders: orders.length,
    conversion: clicks ? round((orders.length / clicks) * 100) : 0,
    totalSales: round(totalSales),
    commissionPending: round(pending),
    commissionApproved: round(approved),
    commissionPaid: round(paidCommission),
    paidOut: round(paidOut),
    // Commissions in 'approved' status are exactly those owed but not yet
    // settled (settling flips them to 'paid'), so this is the payable balance.
    payableBalance: round(approved),
  };
}

const round2 = (n) => Math.round(n * 100) / 100;
const campKey = (c) => (c && String(c).trim()) ? String(c).trim() : 'direct';

// Per-campaign performance (clicks + orders + sales + commission) for an influencer.
export async function campaignBreakdown(influencerId) {
  const clicks = await ReferralClick.findAll({ where: { influencerId }, attributes: ['campaign'] });
  const orders = await Order.findAll({ where: { influencerId }, attributes: ['referralCampaign', 'totalAmount', 'commissionAmount'] });
  const map = {};
  const row = (k) => (map[k] ||= { campaign: k, clicks: 0, orders: 0, sales: 0, commission: 0 });
  for (const c of clicks) row(campKey(c.campaign)).clicks += 1;
  for (const o of orders) {
    const m = row(campKey(o.referralCampaign));
    m.orders += 1;
    m.sales += parseFloat(o.totalAmount) || 0;
    m.commission += parseFloat(o.commissionAmount) || 0;
  }
  return Object.values(map)
    .map((m) => ({ ...m, sales: round2(m.sales), commission: round2(m.commission), conversion: m.clicks ? round2((m.orders / m.clicks) * 100) : 0 }))
    .sort((a, b) => b.sales - a.sales || b.clicks - a.clicks);
}

// Ranked list of approved influencers by sales driven.
export async function leaderboard(limit = 50) {
  const infs = await Influencer.findAll({ where: { status: 'approved' } });
  const rows = await Promise.all(infs.map(async (inf) => {
    const user = await User.findByPk(inf.userId);
    const agg = await Order.findAll({ where: { influencerId: inf.id }, attributes: ['totalAmount', 'commissionAmount'] });
    const sales = agg.reduce((a, o) => a + (parseFloat(o.totalAmount) || 0), 0);
    const commission = agg.reduce((a, o) => a + (parseFloat(o.commissionAmount) || 0), 0);
    return { id: inf.id, name: user?.name, referralCode: inf.referralCode, orders: agg.length, sales: round2(sales), commission: round2(commission) };
  }));
  rows.sort((a, b) => b.sales - a.sales || b.commission - a.commission);
  return rows.map((r, i) => ({ rank: i + 1, ...r })).slice(0, limit);
}

// An influencer's rank among approved partners (1-based) + total partner count.
export async function rankOf(influencerId) {
  const board = await leaderboard(10000);
  const idx = board.findIndex((r) => r.id === Number(influencerId));
  return { rank: idx >= 0 ? idx + 1 : null, totalPartners: board.length };
}
