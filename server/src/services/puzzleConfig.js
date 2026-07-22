import { Setting } from '../models/index.js';

// Default word-puzzle game config. Used as the fallback and as the shape the
// admin editor edits. Stored (when customised) in Setting key 'puzzle-config'.
export const DEFAULT_PUZZLE_CONFIG = {
  enabled: true,
  rewardDays: 14,
  levels: [
    { level: 1, word: 'AMBER',     clue: 'Warm golden resin at the heart of many orientals.', discount: 5 },
    { level: 2, word: 'JASMINE',   clue: 'A small white flower prized by perfumers.',         discount: 10 },
    { level: 3, word: 'FRAGRANCE', clue: 'Another word for a captivating scent.',             discount: 15 },
  ],
};

const normWord = (s) => String(s || '').toUpperCase().replace(/[^A-Z]/g, '');

function clampNum(v, lo, hi, dflt) {
  const n = Number(v);
  if (!Number.isFinite(n)) return dflt;
  return Math.min(hi, Math.max(lo, n));
}

// Merge saved/partial input onto the defaults so the config is always complete
// and valid (3 levels, sane numbers, non-empty words ≥ 3 letters).
function merge(saved = {}) {
  const d = DEFAULT_PUZZLE_CONFIG;
  const levels = [1, 2, 3].map((lvl) => {
    const def = d.levels[lvl - 1];
    const sv = Array.isArray(saved.levels) ? saved.levels.find((l) => Number(l.level) === lvl) : null;
    const w = normWord(sv?.word);
    return {
      level: lvl,
      word: w.length >= 3 ? w : def.word,
      clue: (typeof sv?.clue === 'string' && sv.clue.trim()) ? sv.clue.trim() : def.clue,
      discount: clampNum(sv?.discount, 1, 100, def.discount),
    };
  });
  return {
    enabled: typeof saved.enabled === 'boolean' ? saved.enabled : d.enabled,
    rewardDays: Math.round(clampNum(saved.rewardDays, 1, 365, d.rewardDays)),
    levels,
  };
}

export async function getPuzzleConfig() {
  try {
    const row = await Setting.findByPk('puzzle-config');
    return row?.value ? merge(JSON.parse(row.value)) : DEFAULT_PUZZLE_CONFIG;
  } catch {
    return DEFAULT_PUZZLE_CONFIG;
  }
}

export function normalizeForSave(input) {
  return merge(input || {});
}
