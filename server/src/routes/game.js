import { Router } from 'express';
import { Op } from 'sequelize';
import { Coupon, PuzzleReward } from '../models/index.js';
import { optionalAuth } from '../middleware/auth.js';
import { getPuzzleConfig } from '../services/puzzleConfig.js';

const router = Router();

// Puzzle words/clues/rewards are admin-maintained (Settings → puzzle-config);
// answers never leave the server — the client only gets the clue + shuffled
// letters.

const normalize = (s) => String(s || '').toUpperCase().replace(/[^A-Z]/g, '');

function scramble(word) {
  const letters = word.split('');
  for (let tries = 0; tries < 12; tries++) {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    if (letters.join('') !== word) break;
  }
  return letters;
}

async function uniqueCode(level) {
  for (let i = 0; i < 20; i++) {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    const code = `JOKER-L${level}-${rand}`;
    // eslint-disable-next-line no-await-in-loop
    if (!(await Coupon.findOne({ where: { code } }))) return code;
  }
  return `JOKER-L${level}-${Date.now().toString(36).toUpperCase()}`;
}

function couponView(coupon, discount) {
  return {
    code: coupon.code,
    value: discount ?? parseFloat(coupon.value),
    endDate: coupon.endDate,
  };
}

// Puzzle state — clues + shuffled letters, plus the caller's claimed rewards.
router.get('/puzzle/state', optionalAuth, async (req, res) => {
  try {
    const config = await getPuzzleConfig();
    if (!config.enabled) return res.json({ enabled: false, levels: [], claimed: [] });

    const levels = config.levels.map((p) => ({
      level: p.level,
      discount: p.discount,
      clue: p.clue,
      length: p.word.length,
      scrambled: scramble(p.word),
    }));

    let claimed = [];
    if (req.user) {
      const rewards = await PuzzleReward.findAll({ where: { userId: req.user.id } });
      const coupons = await Coupon.findAll({
        where: { code: { [Op.in]: rewards.map((r) => r.couponCode) } },
      });
      const byCode = Object.fromEntries(coupons.map((c) => [c.code, c]));
      claimed = rewards
        .map((r) => {
          const c = byCode[r.couponCode];
          if (!c) return null;
          // `used` = the reward coupon has already been redeemed (usage
          // exhausted). Kept in the list so the level still reads as solved;
          // the client hides used ones from the visible coupon list.
          const used = c.usageLimit != null && c.usedCount >= c.usageLimit;
          // Use the coupon's own minted value so existing rewards keep their
          // discount even if the admin later changes the level's percentage.
          return { level: r.level, used, ...couponView(c, null) };
        })
        .filter(Boolean)
        .sort((a, b) => a.level - b.level);
    }

    res.json({ enabled: true, levels, claimed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Attempt a level. Guests get correct/incorrect only; logged-in solvers get a
// coupon minted to their account (levels must be won in order, once each).
router.post('/puzzle/attempt', optionalAuth, async (req, res) => {
  try {
    const config = await getPuzzleConfig();
    if (!config.enabled) return res.status(400).json({ message: 'The game is not available right now' });

    const { level, guess } = req.body;
    const puzzle = config.levels.find((p) => p.level === Number(level));
    if (!puzzle) return res.status(400).json({ message: 'Unknown level' });

    if (normalize(guess) !== normalize(puzzle.word)) {
      return res.json({ correct: false });
    }

    // Correct, but guests can't hold a personal coupon yet.
    if (!req.user) {
      return res.json({ correct: true, needLogin: true, discount: puzzle.discount });
    }

    const userId = req.user.id;

    // Already claimed → return the existing coupon (idempotent).
    const existing = await PuzzleReward.findOne({ where: { userId, level: puzzle.level } });
    if (existing) {
      const c = await Coupon.findOne({ where: { code: existing.couponCode } });
      if (c) return res.json({ correct: true, coupon: couponView(c, puzzle.discount) });
    }

    // Enforce sequential progression.
    const wonBelow = await PuzzleReward.count({ where: { userId, level: { [Op.lt]: puzzle.level } } });
    if (wonBelow < puzzle.level - 1) {
      return res.status(400).json({ message: 'Solve the earlier levels first' });
    }

    const code = await uniqueCode(puzzle.level);
    const endDate = new Date(Date.now() + config.rewardDays * 24 * 60 * 60 * 1000);
    const coupon = await Coupon.create({
      code,
      description: `Puzzle reward — ${puzzle.discount}% off`,
      type: 'percentage',
      value: puzzle.discount,
      usageLimit: 1,
      perUserLimit: 1,
      assignedUserId: userId,
      endDate,
      active: true,
    });

    try {
      await PuzzleReward.create({ userId, level: puzzle.level, couponCode: code });
    } catch (e) {
      // Lost a race for this (user, level) — clean up and return the winner.
      await coupon.destroy();
      const reward = await PuzzleReward.findOne({ where: { userId, level: puzzle.level } });
      const c = reward && (await Coupon.findOne({ where: { code: reward.couponCode } }));
      if (c) return res.json({ correct: true, coupon: couponView(c, puzzle.discount) });
      throw e;
    }

    res.json({ correct: true, coupon: couponView(coupon, puzzle.discount) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
