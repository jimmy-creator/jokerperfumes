/**
 * Colour options for the admin-configurable home hero.
 *
 * Shared by the Admin banner editor and the storefront Hero so the swatches an
 * admin picks are literally the same values that render. Keys are what get
 * persisted in the banner JSON — never store raw hex, or a theme change would
 * leave the hero stranded on the old palette.
 *
 * "Gold" resolves differently for text vs buttons, matching the design: bright
 * gold (--gold) reads on the dark hero photo, while the deeper copper (--copper)
 * is what the design uses for solid gold buttons and stays legible under white
 * label text.
 */

export const HERO_TEXT_COLORS = {
  white: '#ffffff',
  gold: 'var(--gold)',
  black: 'var(--text)',
};

export const HERO_BUTTON_COLORS = {
  black: 'var(--text)',
  white: '#ffffff',
  gold: 'var(--copper)',
};

// Swatch previews for the admin dropdowns (approximations of the tokens above).
export const HERO_SWATCHES = {
  white: '#ffffff',
  gold: '#c8a23c',
  black: '#111111',
};

export const HERO_TEXT_COLOR_OPTIONS = ['white', 'gold', 'black'];
export const HERO_BUTTON_COLOR_OPTIONS = ['black', 'white', 'gold'];

export const textColor = (key, fallback = 'white') =>
  HERO_TEXT_COLORS[key] || HERO_TEXT_COLORS[fallback];

export const buttonColor = (key, fallback = 'black') =>
  HERO_BUTTON_COLORS[key] || HERO_BUTTON_COLORS[fallback];
