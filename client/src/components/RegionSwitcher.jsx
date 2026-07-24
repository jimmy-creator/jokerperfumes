import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown } from 'lucide-react';
import { useRegion } from '../context/RegionContext';
import { useCart } from '../context/CartContext';

// Region (country) switcher — flag + name popup in the navbar's top-right.
// Switching region changes currency, prices, payment methods, address form and
// policy details app-wide. The cart is cleared first (prices are region-specific)
// and the page reloads so everything re-renders in the new region.
export default function RegionSwitcher({ compact = true }) {
  const { t } = useTranslation();
  const { region, regions, regionCode, changeRegion } = useRegion();
  const { cart, clearCart } = useCart();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const select = (code) => {
    setOpen(false);
    if (code === regionCode) return;
    // Region prices differ, so a cart built in one region can't carry over.
    if (cart && cart.length > 0) clearCart();
    changeRegion(code); // persists + reloads
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={t('region.changeRegion')}
        className="flex items-center gap-1.5 rounded-full border border-current/40 px-2.5 py-1.5 text-sm font-medium text-inherit opacity-85 transition-opacity hover:opacity-100"
      >
        <span className="text-base leading-none">{region.flag}</span>
        <span className={compact ? 'hidden sm:inline' : ''}>{region.code.toUpperCase()}</span>
        <ChevronDown className="size-3.5 opacity-70" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+0.4rem)] z-50 w-52 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t('region.shoppingIn')}</p>
          {Object.values(regions).map((r) => (
            <button
              key={r.code}
              type="button"
              role="option"
              aria-selected={r.code === regionCode}
              onClick={() => select(r.code)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span className="text-lg leading-none">{r.flag}</span>
              <span className="flex-1">
                <span className="block font-medium">{r.name}</span>
                <span className="block text-xs text-muted-foreground">{r.currencySymbol}</span>
              </span>
              {r.code === regionCode && <Check className="size-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
