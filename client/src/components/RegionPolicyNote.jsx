import { useRegion } from '../context/RegionContext';
import { CURRENCY, formatPrice } from '../utils/currency';

// A region-aware banner for policy pages. States which region's terms apply and
// surfaces the region-specific figures (currency, free-shipping threshold, tax
// label/rate) so the shared policy structure reflects the active market. The
// detailed legal text per region is authored separately.
export default function RegionPolicyNote() {
  const { region } = useRegion();
  return (
    <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
      <p className="font-medium text-foreground">
        {region.flag} These terms apply to orders shipped within <strong>{region.name}</strong>.
      </p>
      <p className="mt-1 text-muted-foreground">
        Prices and charges are shown in {CURRENCY}. Free shipping on orders above{' '}
        {CURRENCY}{formatPrice(region.freeShippingAbove)}. Prices are inclusive of{' '}
        {region.taxLabel} ({region.taxRate}%). Shopping from a different country?
        Switch your region using the flag in the top-right.
      </p>
    </div>
  );
}
