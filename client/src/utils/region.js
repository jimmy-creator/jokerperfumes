// Runtime region store — the single source of truth for the active region,
// readable synchronously from non-React modules (currency.jsx, api/axios.js)
// as well as from React via RegionContext.
//
// Switching region is a global change (currency, prices, gateways, address,
// policies), so setRegion() persists the choice and reloads the page. A full
// reload guarantees every price/currency across the app re-renders from the
// freshly priced API responses — no need to thread reactivity through the
// hundreds of price call sites.

import { REGIONS, DEFAULT_REGION, isValidRegion } from '../config/regions';

const STORAGE_KEY = 'store-region';

export function getRegionCode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isValidRegion(saved)) return saved;
  } catch {
    /* localStorage unavailable */
  }
  return DEFAULT_REGION;
}

export function getRegion() {
  return REGIONS[getRegionCode()] || REGIONS[DEFAULT_REGION];
}

// Persist the region without reloading — used internally.
export function persistRegion(code) {
  if (!isValidRegion(code)) return;
  try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
}
