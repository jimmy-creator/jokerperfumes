// Server-side region resolution for the dual-region storefront (Saudi + India).
// The client sends the active region in the `X-Region` header (see the client's
// api/axios.js). This drives which product price field is used, the payment
// gateways offered, tax label/rate, and shipping thresholds.

const num = (v, d) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
};

export const REGION_CONFIG = {
  sa: {
    code: 'sa',
    name: 'Saudi Arabia',
    currencyCode: process.env.CURRENCY_CODE_SA || 'SAR',
    taxLabel: 'VAT',
    taxRate: num(process.env.TAX_RATE_SA, 15),
    // Saudi gateways. COD + bank transfer are always offered; the hosted
    // gateways only appear when their keys are configured (see payment route).
    gateways: ['tap', 'tamara', 'cod', 'bank_transfer'],
    shipping: {
      freeAbove: num(process.env.SHIPPING_FREE_ABOVE_SA, 200),
      flat: num(process.env.SHIPPING_FLAT_RATE_SA, 25),
      express: num(process.env.SHIPPING_EXPRESS_RATE_SA, 40),
      perItem: num(process.env.SHIPPING_PER_ITEM_SA, 0),
    },
  },
  in: {
    code: 'in',
    name: 'India',
    currencyCode: process.env.CURRENCY_CODE_IN || 'INR',
    taxLabel: 'GST',
    taxRate: num(process.env.TAX_RATE_IN, 18),
    gateways: ['razorpay', 'cod'],
    shipping: {
      freeAbove: num(process.env.SHIPPING_FREE_ABOVE_IN, 3000),
      flat: num(process.env.SHIPPING_FLAT_RATE_IN, 49),
      express: num(process.env.SHIPPING_EXPRESS_RATE_IN, 99),
      perItem: num(process.env.SHIPPING_PER_ITEM_IN, 0),
    },
  },
};

export const DEFAULT_REGION = 'sa';

// Resolve the region config from a request's X-Region header.
export function getRegion(req) {
  const code = String(req?.headers?.['x-region'] || req?.body?.region || '').toLowerCase();
  return REGION_CONFIG[code] || REGION_CONFIG[DEFAULT_REGION];
}

// Resolve a region config from a bare code (e.g. an order's stored region).
export function regionByCode(code) {
  return REGION_CONFIG[String(code || '').toLowerCase()] || REGION_CONFIG[DEFAULT_REGION];
}

// The product price field to read for this region.
export function priceField(region) {
  return region?.code === 'in' ? 'priceInr' : 'price';
}

// Pick the region price for a product/variant object, falling back to the
// Saudi base price when the India price hasn't been entered.
export function pickPrice(obj, region) {
  if (region?.code === 'in') {
    const inr = obj?.priceInr;
    if (inr != null && inr !== '') return parseFloat(inr);
  }
  return parseFloat(obj?.price);
}

// Return a plain product object with prices resolved to the given region, so
// the storefront can render `product.price` / `variant.price` unchanged.
export function serializeProductForRegion(product, region) {
  const p = typeof product?.toJSON === 'function' ? product.toJSON() : { ...product };
  if (region?.code === 'in') {
    if (p.priceInr != null && p.priceInr !== '') p.price = p.priceInr;
    if (p.comparePriceInr != null && p.comparePriceInr !== '') p.comparePrice = p.comparePriceInr;
    if (Array.isArray(p.variants)) {
      p.variants = p.variants.map((v) => ({
        ...v,
        price: (v && v.priceInr != null && v.priceInr !== '') ? v.priceInr : v?.price,
      }));
    }
  }
  return p;
}
