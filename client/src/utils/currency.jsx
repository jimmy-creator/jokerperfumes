import { getRegion } from './region';

// Currency is driven by the active region (Saudi = SAR, India = ₹). The region
// is chosen at runtime and persisted; switching it reloads the page, so these
// synchronous reads of getRegion() are always consistent for a given render.
//
// Legacy env vars (VITE_CURRENCY_*) remain the fallback when, for some reason,
// no region is resolved.
const ENV_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || 'SAR';

// Static export for back-compat (admin/POS/finance code that isn't region-aware).
// Storefront callers should prefer <CurrencySymbol /> or the values below, which
// reflect the active region.
export const CURRENCY = getRegion()?.currencySymbol || ENV_SYMBOL;
export const CURRENCY_CODE = getRegion()?.currencyCode || 'SAR';
export const CURRENCY_ICON = import.meta.env.VITE_CURRENCY_ICON || '';

// Decimal places for displayed prices, per active region (SAR/INR = 2).
export const CURRENCY_DECIMALS = (() => {
  const n = getRegion()?.decimals;
  return Number.isFinite(n) && n >= 0 && n <= 4 ? n : 2;
})();

// step= value for <input type="number"> price fields.
export const PRICE_STEP = (1 / 10 ** CURRENCY_DECIMALS).toFixed(CURRENCY_DECIMALS);

// Format a numeric price with the store's decimal precision.
export function formatPrice(value) {
  return (parseFloat(value) || 0).toFixed(CURRENCY_DECIMALS);
}

// Region currency label, rendered as text (e.g. "SAR" / "₹"). Re-evaluated on
// every render so it reflects the active region.
export function CurrencySymbol({ className = '' }) {
  return <span className={className}>{getRegion()?.currencySymbol || ENV_SYMBOL}</span>;
}
