import { Router } from 'express';
import { Setting } from '../models/index.js';
import { protect, admin, requirePermission } from '../middleware/auth.js';

const router = Router();

// Get theme (public — all visitors need the active theme).
// Returns null when no row exists so the client falls through to its
// per-store `defaultTheme`. Hardcoding 'default' here used to override
// the client default and keep re-seeding the obsolete value into
// every visitor's localStorage.
router.get('/theme', async (req, res) => {
  try {
    const setting = await Setting.findByPk('theme');
    res.json({ theme: setting?.value || null });
  } catch (error) {
    res.json({ theme: null });
  }
});

// Update theme (admin only)
router.put('/theme', protect, admin, async (req, res) => {
  try {
    const { theme } = req.body;
    // Must stay in sync with the keys in client/src/layouts/store/themes.js
    const allowed = ['default', 'midnight', 'minimal', 'forest', 'royal', 'marketplace', 'elegantBayt', 'blanc', 'jokerPerfumes'];
    if (!allowed.includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme' });
    }

    await Setting.upsert({ key: 'theme', value: theme });
    res.json({ theme });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get hero image (public)
router.get('/hero-image', async (req, res) => {
  try {
    const setting = await Setting.findByPk('hero-image');
    res.json({ value: setting?.value || null });
  } catch (error) {
    res.json({ value: null });
  }
});

// Update hero image (admin only)
router.put('/hero-image', protect, admin, async (req, res) => {
  try {
    const { value } = req.body;
    if (!value) return res.status(400).json({ message: 'Image URL is required' });
    await Setting.upsert({ key: 'hero-image', value });
    res.json({ value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get banners (public)
router.get('/banners', async (req, res) => {
  try {
    const setting = await Setting.findByPk('banners');
    const banners = setting?.value ? JSON.parse(setting.value) : [];
    res.json(banners);
  } catch (error) {
    res.json([]);
  }
});

// Update banners (admin only) — max 5
router.put('/banners', protect, admin, async (req, res) => {
  try {
    const { banners } = req.body;
    if (!Array.isArray(banners) || banners.length > 5) {
      return res.status(400).json({ message: 'Provide an array of up to 5 banners' });
    }
    await Setting.upsert({ key: 'banners', value: JSON.stringify(banners) });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mid-page banners (rendered below the best-sellers section)
router.get('/mid-banners', async (req, res) => {
  try {
    const setting = await Setting.findByPk('mid-banners');
    const banners = setting?.value ? JSON.parse(setting.value) : [];
    res.json(banners);
  } catch (error) {
    res.json([]);
  }
});

router.put('/mid-banners', protect, admin, async (req, res) => {
  try {
    const { banners } = req.body;
    if (!Array.isArray(banners) || banners.length > 3) {
      return res.status(400).json({ message: 'Provide an array of up to 3 mid-page banners' });
    }
    await Setting.upsert({ key: 'mid-banners', value: JSON.stringify(banners) });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Category cards (large coloured promo tiles on the home page)
router.get('/category-cards', async (req, res) => {
  try {
    const setting = await Setting.findByPk('category-cards');
    const items = setting?.value ? JSON.parse(setting.value) : [];
    res.json(items);
  } catch (error) {
    res.json([]);
  }
});

router.put('/category-cards', protect, admin, async (req, res) => {
  try {
    const { cards } = req.body;
    if (!Array.isArray(cards) || cards.length > 8) {
      return res.status(400).json({ message: 'Provide an array of up to 8 category cards' });
    }
    await Setting.upsert({ key: 'category-cards', value: JSON.stringify(cards) });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Scent-quiz mapping (which real category each quiz archetype resolves to).
// The storefront quiz always produces one of four fixed archetypes; the admin
// maps each to a current category name so the quiz survives category changes.
const QUIZ_ARCHETYPES = ['bold', 'fresh', 'warm', 'mysterious'];

router.get('/scent-quiz-map', async (req, res) => {
  try {
    const setting = await Setting.findByPk('scent-quiz-map');
    const map = setting?.value ? JSON.parse(setting.value) : {};
    res.json(map);
  } catch (error) {
    res.json({});
  }
});

router.put('/scent-quiz-map', protect, admin, async (req, res) => {
  try {
    const { map } = req.body;
    if (!map || typeof map !== 'object' || Array.isArray(map)) {
      return res.status(400).json({ message: 'Provide a { archetype: categoryName } map' });
    }
    // Keep only known archetype keys with string category names.
    const clean = {};
    for (const key of QUIZ_ARCHETYPES) {
      if (typeof map[key] === 'string' && map[key].trim()) clean[key] = map[key].trim();
    }
    await Setting.upsert({ key: 'scent-quiz-map', value: JSON.stringify(clean) });
    res.json(clean);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Announcement bar (rotating promo strings shown above the navbar)
router.get('/announcements', async (req, res) => {
  try {
    const setting = await Setting.findByPk('announcements');
    const items = setting?.value ? JSON.parse(setting.value) : [];
    res.json(items);
  } catch (error) {
    res.json([]);
  }
});

router.put('/announcements', protect, admin, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length > 10) {
      return res.status(400).json({ message: 'Provide an array of up to 10 announcement strings' });
    }
    const clean = items.map((s) => String(s || '').trim()).filter(Boolean);
    await Setting.upsert({ key: 'announcements', value: JSON.stringify(clean) });
    res.json(clean);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// B2B bank-transfer details — free-form text included in the quote email when
// the admin picks the bank-transfer payment method.
router.get('/b2b-bank-details', protect, admin, async (req, res) => {
  try {
    const setting = await Setting.findByPk('b2b_bank_details');
    res.json({ value: setting?.value || '' });
  } catch (error) {
    res.json({ value: '' });
  }
});

router.put('/b2b-bank-details', protect, admin, async (req, res) => {
  try {
    const value = String(req.body.value || '').trim();
    await Setting.upsert({ key: 'b2b_bank_details', value });
    res.json({ value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
