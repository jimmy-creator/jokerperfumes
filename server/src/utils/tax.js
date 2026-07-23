// Tax is INCLUDED in product price (price-inclusive model)
// Extract tax from the selling price: tax = price - (price / (1 + rate/100))
//
// Dual-region: when a `region` is passed (Saudi VAT / India GST), taxable items
// use the region's rate and label. Without a region, fall back to each item's
// own taxRate (POS and other single-region callers keep working unchanged).

export function calculateTax(orderItems, region = null) {
  let totalTax = 0;

  for (const item of orderItems) {
    if (!item.taxable) continue;
    const rate = region?.taxRate != null ? region.taxRate : item.taxRate;
    if (!rate) continue;
    const itemTotal = item.price * item.quantity;
    // Extract tax from inclusive price
    const taxAmount = Math.round((itemTotal - (itemTotal / (1 + rate / 100))) * 100) / 100;
    totalTax += taxAmount;
  }

  totalTax = Math.round(totalTax * 100) / 100;

  // Single flat tax — no CGST/SGST/IGST split. `label` is VAT (Saudi) or GST (India).
  const breakdown = { totalTax, inclusive: true, label: region?.taxLabel || 'VAT' };

  return { totalTax, breakdown };
}
