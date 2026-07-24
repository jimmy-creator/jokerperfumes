import { useTranslation } from 'react-i18next';
import { useRegion } from '../context/RegionContext';
import { CURRENCY, formatPrice } from '../utils/currency';

// A region-aware banner for policy pages. States which region's terms apply and
// surfaces the region-specific figures (currency, free-shipping threshold, tax
// label/rate) so the shared policy structure reflects the active market. The
// detailed legal text per region is authored separately.
export default function RegionPolicyNote() {
  const { t } = useTranslation();
  const { region } = useRegion();
  return (
    <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
      <p className="font-medium text-foreground">
        {t('region.policyAppliesTo', { flag: region.flag, name: region.name })}
      </p>
      <p className="mt-1 text-muted-foreground">
        {t('region.policyDetails', {
          currency: CURRENCY,
          amount: formatPrice(region.freeShippingAbove),
          taxLabel: region.taxLabel,
          taxRate: region.taxRate,
        })}
      </p>
    </div>
  );
}
