import { Router } from 'express';
import { Influencer, Coupon, ReferralClick } from '../models/index.js';

const router = Router();

// Log a click landing through a referral link (fire-and-forget from the storefront).
router.post('/click', async (req, res) => {
  try {
    const { code, path, campaign } = req.body;
    if (!code) return res.json({ ok: false });
    const inf = await Influencer.findOne({
      where: { referralCode: String(code).toUpperCase().trim(), status: 'approved' },
    });
    if (!inf) return res.json({ ok: false });
    await ReferralClick.create({
      influencerId: inf.id,
      referralCode: inf.referralCode,
      campaign: (campaign && String(campaign).trim()) || null,
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
      userAgent: req.headers['user-agent'] || null,
      landingPath: path || null,
    });
    res.json({ ok: true, code: inf.referralCode });
  } catch {
    res.json({ ok: false });
  }
});

// Validate a referral code; returns the auto-apply discount (if any) so the
// storefront can pre-fill the coupon at checkout.
router.get('/:code', async (req, res) => {
  try {
    const inf = await Influencer.findOne({
      where: { referralCode: req.params.code.toUpperCase().trim(), status: 'approved' },
    });
    if (!inf) return res.json({ valid: false });
    let discount = null;
    if (inf.discountCouponId) {
      const c = await Coupon.findByPk(inf.discountCouponId);
      if (c && c.active) discount = { code: c.code, type: c.type, value: c.value };
    }
    res.json({ valid: true, code: inf.referralCode, discount });
  } catch {
    res.json({ valid: false });
  }
});

export default router;
