import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { CurrencySymbol, formatPrice } from '../../utils/currency';
import { localizedName } from '../../utils/i18nHelpers';
import { cn } from '@/lib/utils';

// Fallback bottle art from the Figma design, used while the catalog has no
// uploaded photography. Keyed off the product id so a given product keeps the
// same bottle between renders.
const FALLBACK_BOTTLES = [
  '/images/joker/bottle-1.webp',
  '/images/joker/bottle-2.webp',
  '/images/joker/bottle-3.webp',
  '/images/joker/bottle-4.webp',
];

export default function ProductCard({ product, eager = false }) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const displayName = localizedName(product);
  const imgFull = product.images?.[0];
  const img = imgFull?.replace(/\/uploads\/(.+?)\.webp$/, '/api/upload/thumb/$1.webp') || imgFull;
  const fallback = FALLBACK_BOTTLES[(product.id || 0) % FALLBACK_BOTTLES.length];
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discount = hasDiscount
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;
  const soldOut = product.stock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    addToCart(product, 1, null);
  };

  // `h-full` + `mt-auto` on the price block is what aligns the Add to Cart
  // buttons. Grid rows stretch every card to the tallest in THAT row, so the
  // alignment is per-row — a long product name in row 2 never stretches row 1.
  return (
    <article className="group relative flex h-full flex-col border border-foreground bg-card transition-colors hover:border-[color:var(--copper)]">
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden bg-[color:var(--bg-warm)]">
        <img
          src={img || fallback}
          alt={displayName}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          className="aspect-[4/5] w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ribbon: sold out wins, then best-seller */}
        {soldOut ? (
          <span className="absolute left-0 top-2 bg-foreground px-2 py-1 font-serif text-[11px] uppercase tracking-wider text-background">
            {t('common.outOfStock')}
          </span>
        ) : product.featured ? (
          <span
            className="absolute left-0 top-2 px-2 py-1 font-serif text-[11px] uppercase tracking-wider text-white"
            style={{ backgroundColor: 'var(--danger)' }}
          >
            {t('product.bestSeller', { defaultValue: 'Best Seller' })}
          </span>
        ) : null}

        {discount > 0 && !soldOut && (
          <span
            className="absolute right-2 top-2 px-1.5 py-1 font-serif text-[11px] uppercase tracking-wider text-[color:var(--text)]"
            style={{ backgroundColor: 'var(--gold)' }}
          >
            {t('product.save', { defaultValue: 'Save' })} {discount}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {product.brand || ' '}
          </span>
          {product.ratings > 0 && (
            <span className="shrink-0 text-[11px]" style={{ color: 'var(--copper)' }}>
              {Number(product.ratings).toFixed(1)}★
            </span>
          )}
        </div>

        <Link
          to={`/product/${product.slug}`}
          className="line-clamp-2 font-serif text-lg uppercase leading-tight tracking-wide text-foreground transition-colors hover:text-[color:var(--copper)]"
        >
          {displayName}
        </Link>

        <p className="font-fell truncate text-xs text-muted-foreground">{product.category}</p>

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-serif text-xl tracking-wide text-foreground">
            <CurrencySymbol />{formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              <CurrencySymbol />{formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={soldOut}
          className={cn(
            'mt-3 w-full bg-foreground py-2.5 font-serif text-sm uppercase tracking-[0.15em] text-background transition-colors',
            soldOut ? 'cursor-not-allowed opacity-40' : 'hover:bg-[color:var(--copper)]',
          )}
        >
          {soldOut ? t('common.outOfStock') : `+ ${t('common.addToCart')}`}
        </button>
      </div>
    </article>
  );
}
