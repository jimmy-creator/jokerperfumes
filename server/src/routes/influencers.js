import { Router } from 'express';
import { Influencer, User, Order, Payout, Coupon } from '../models/index.js';
import { protect, admin, requireRole, generateToken } from '../middleware/auth.js';
import { generateReferralCode, influencerStats, campaignBreakdown, leaderboard, rankOf } from '../services/referral.js';
import { sendInfluencerApproved, sendInfluencerPayout } from '../services/emailService.js';

// Mark approved commissions as paid (oldest first) up to `amount`.
async function settleApprovedCommissions(influencerId, amount) {
  const approved = await Order.findAll({
    where: { influencerId, commissionStatus: 'approved' },
    order: [['createdAt', 'ASC']],
  });
  let remaining = parseFloat(amount);
  for (const o of approved) {
    const c = parseFloat(o.commissionAmount) || 0;
    if (remaining + 0.001 < c) break;
    await o.update({ commissionStatus: 'paid' });
    remaining -= c;
  }
}

async function emailFor(influencerId) {
  const inf = await Influencer.findByPk(influencerId);
  const user = inf ? await User.findByPk(inf.userId) : null;
  return { inf, user, email: user?.email };
}

const router = Router();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Shape an influencer + its user for client responses (no password).
async function present(inf) {
  const user = await User.findByPk(inf.userId, { attributes: ['id', 'name', 'email', 'phone'] });
  const coupon = inf.discountCouponId ? await Coupon.findByPk(inf.discountCouponId) : null;
  return {
    id: inf.id,
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    referralCode: inf.referralCode,
    status: inf.status,
    commissionType: inf.commissionType,
    commissionRate: inf.commissionRate,
    discountCoupon: coupon ? { id: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value } : null,
    instagram: inf.instagram, youtube: inf.youtube, audienceSize: inf.audienceSize, bio: inf.bio,
    bankName: inf.bankName, accountName: inf.accountName, iban: inf.iban,
    createdAt: inf.createdAt,
  };
}

/* ───────────────── Public: apply to the program ───────────────── */
router.post('/apply', async (req, res) => {
  try {
    const { name, email, password, phone, instagram, youtube, audienceSize, bio } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing) return res.status(400).json({ message: 'An account with this email already exists' });

    const user = await User.create({
      name, email: email.toLowerCase().trim(), password, phone: phone || null, role: 'influencer',
    });
    const referralCode = await generateReferralCode(name);
    const inf = await Influencer.create({
      userId: user.id, referralCode, status: 'pending',
      instagram: instagram || null, youtube: youtube || null, audienceSize: audienceSize || null, bio: bio || null,
    });

    // Log them in so they can see their (pending) dashboard.
    res.cookie('token', generateToken(user.id), cookieOptions);
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, influencer: await present(inf) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ───────────────── Influencer self-service ───────────────── */
async function loadMine(req, res, next) {
  const inf = await Influencer.findOne({ where: { userId: req.user.id } });
  if (!inf) return res.status(404).json({ message: 'Influencer profile not found' });
  req.influencer = inf;
  next();
}

router.get('/me', protect, requireRole('influencer'), loadMine, async (req, res) => {
  const [stats, rank] = await Promise.all([influencerStats(req.influencer.id), rankOf(req.influencer.id)]);
  res.json({ ...(await present(req.influencer)), stats: { ...stats, ...rank } });
});

router.get('/me/campaigns', protect, requireRole('influencer'), loadMine, async (req, res) => {
  res.json(await campaignBreakdown(req.influencer.id));
});

router.get('/me/orders', protect, requireRole('influencer'), loadMine, async (req, res) => {
  const orders = await Order.findAll({
    where: { influencerId: req.influencer.id },
    attributes: ['id', 'orderNumber', 'totalAmount', 'commissionAmount', 'commissionStatus', 'orderStatus', 'paymentStatus', 'createdAt'],
    order: [['createdAt', 'DESC']],
    limit: 200,
  });
  res.json(orders);
});

router.get('/me/payouts', protect, requireRole('influencer'), loadMine, async (req, res) => {
  const payouts = await Payout.findAll({ where: { influencerId: req.influencer.id }, order: [['createdAt', 'DESC']] });
  res.json(payouts);
});

// Update own payout details / socials (not status, code or rate).
router.put('/me', protect, requireRole('influencer'), loadMine, async (req, res) => {
  const allowed = ['instagram', 'youtube', 'audienceSize', 'bio', 'bankName', 'accountName', 'iban'];
  const data = {};
  for (const k of allowed) if (k in req.body) data[k] = req.body[k];
  await req.influencer.update(data);
  res.json(await present(req.influencer));
});

// Influencer requests a payout of their current payable balance.
router.post('/me/payout-request', protect, requireRole('influencer'), loadMine, async (req, res) => {
  try {
    const existing = await Payout.findOne({ where: { influencerId: req.influencer.id, status: 'requested' } });
    if (existing) return res.status(400).json({ message: 'You already have a pending payout request' });
    const stats = await influencerStats(req.influencer.id);
    const amount = stats.payableBalance;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'No payable balance to request' });
    const payout = await Payout.create({
      influencerId: req.influencer.id, amount, method: 'bank', status: 'requested',
    });
    res.status(201).json(payout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ───────────────── Admin ───────────────── */
router.get('/', protect, admin, async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  const list = await Influencer.findAll({ where, order: [['createdAt', 'DESC']] });
  const rows = await Promise.all(list.map(async (inf) => ({ ...(await present(inf)), stats: await influencerStats(inf.id) })));
  res.json(rows);
});

// Admin: leaderboard (defined before /:id so it isn't shadowed).
router.get('/leaderboard', protect, admin, async (req, res) => {
  try { res.json(await leaderboard(parseInt(req.query.limit) || 50)); }
  catch (error) { res.status(500).json({ message: error.message }); }
});

// Admin: list pending payout requests (defined before /:id so it isn't shadowed).
router.get('/payout-requests', protect, admin, async (req, res) => {
  try {
    const reqs = await Payout.findAll({ where: { status: 'requested' }, order: [['createdAt', 'ASC']] });
    const rows = await Promise.all(reqs.map(async (p) => {
      const inf = await Influencer.findByPk(p.influencerId);
      const user = inf ? await User.findByPk(inf.userId) : null;
      return { ...p.toJSON(), influencer: { id: inf?.id, name: user?.name, email: user?.email, referralCode: inf?.referralCode } };
    }));
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: approve (pay) or reject a payout request.
router.put('/payouts/:payoutId', protect, admin, async (req, res) => {
  try {
    const payout = await Payout.findByPk(req.params.payoutId);
    if (!payout) return res.status(404).json({ message: 'Not found' });
    if (payout.status !== 'requested') return res.status(400).json({ message: 'Already processed' });
    const { action, reference, method } = req.body; // 'pay' | 'reject'

    if (action === 'reject') {
      await payout.update({ status: 'rejected' });
      return res.json(payout);
    }
    await payout.update({ status: 'paid', paidAt: new Date(), reference: reference || payout.reference, method: method || payout.method, createdBy: req.user.id });
    await settleApprovedCommissions(payout.influencerId, payout.amount);
    const { user } = await emailFor(payout.influencerId);
    if (user?.email) sendInfluencerPayout(user.email, { name: user.name, amount: payout.amount, method: payout.method, reference: payout.reference }).catch(() => {});
    res.json(payout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, admin, async (req, res) => {
  const inf = await Influencer.findByPk(req.params.id);
  if (!inf) return res.status(404).json({ message: 'Not found' });
  res.json({ ...(await present(inf)), stats: await influencerStats(inf.id) });
});

router.get('/:id/orders', protect, admin, async (req, res) => {
  const orders = await Order.findAll({
    where: { influencerId: req.params.id },
    attributes: ['id', 'orderNumber', 'totalAmount', 'commissionAmount', 'commissionStatus', 'orderStatus', 'paymentStatus', 'createdAt'],
    order: [['createdAt', 'DESC']],
  });
  res.json(orders);
});

// Approve / reject / suspend, set code, commission, and discount coupon.
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const inf = await Influencer.findByPk(req.params.id);
    if (!inf) return res.status(404).json({ message: 'Not found' });
    const wasApproved = inf.status === 'approved';

    const { status, commissionType, commissionRate, referralCode, discountCouponId } = req.body;
    const data = {};
    if (status && ['pending', 'approved', 'suspended', 'rejected'].includes(status)) data.status = status;
    if (commissionType && ['percentage', 'fixed'].includes(commissionType)) data.commissionType = commissionType;
    if (commissionRate !== undefined) data.commissionRate = commissionRate;
    if (discountCouponId !== undefined) data.discountCouponId = discountCouponId || null;
    if (referralCode && referralCode !== inf.referralCode) {
      const code = referralCode.toUpperCase().trim();
      const clash = await Influencer.findOne({ where: { referralCode: code } });
      if (clash && clash.id !== inf.id) return res.status(400).json({ message: 'Referral code already in use' });
      data.referralCode = code;
    }
    await inf.update(data);

    // Keep the linked discount coupon pointing back at this influencer.
    if (data.discountCouponId) await Coupon.update({ influencerId: inf.id }, { where: { id: data.discountCouponId } });

    // Notify on first approval.
    if (data.status === 'approved' && !wasApproved) {
      const user = await User.findByPk(inf.userId);
      if (user?.email) sendInfluencerApproved(user.email, { name: user.name, referralCode: inf.referralCode, commissionType: inf.commissionType, commissionRate: inf.commissionRate }).catch(() => {});
    }
    res.json(await present(inf));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Record a payout directly (admin marks a settlement as paid).
router.post('/:id/payouts', protect, admin, async (req, res) => {
  try {
    const inf = await Influencer.findByPk(req.params.id);
    if (!inf) return res.status(404).json({ message: 'Not found' });
    const { amount, method, reference, note } = req.body;
    if (!amount || parseFloat(amount) <= 0) return res.status(400).json({ message: 'Valid amount required' });
    const payout = await Payout.create({
      influencerId: inf.id, amount, method: method || 'bank',
      reference: reference || null, note: note || null, status: 'paid', paidAt: new Date(), createdBy: req.user.id,
    });
    await settleApprovedCommissions(inf.id, amount);
    const user = await User.findByPk(inf.userId);
    if (user?.email) sendInfluencerPayout(user.email, { name: user.name, amount, method: payout.method, reference }).catch(() => {});
    res.status(201).json(payout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
