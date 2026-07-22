import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { localizedName } from '../../utils/i18nHelpers';
import { PLACEHOLDER_CATEGORIES } from '../../utils/placeholders';

const B2B_ENABLED = import.meta.env.VITE_FEATURE_B2B === 'true';
const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'Joker Perfumes';

// Methods actually offered at checkout (Tap gateway + cash on delivery).
const PAYMENTS = ['Mada', 'Visa', 'Mastercard', 'Apple Pay', 'COD'];

// Brand social icons (inline SVG — avoids depending on brand icons that some
// lucide versions drop). Links are placeholders until real profiles are shared.
const SOCIALS = [
  { label: 'Facebook', href: '#', path: 'M13.5 9H15V6.5h-1.9C11 6.5 10 7.8 10 9.7V11H8.5v2.5H10V19h2.6v-5.5h1.8l.3-2.5h-2.1V9.9c0-.6.2-.9.9-.9Z' },
  { label: 'Instagram', href: '#', path: 'M12 8.6A3.4 3.4 0 1 0 12 15.4 3.4 3.4 0 0 0 12 8.6Zm0 5.6a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Zm3.6-5.9a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0ZM8.4 6.2h7.2A2.6 2.6 0 0 1 18.2 8.8v6.4a2.6 2.6 0 0 1-2.6 2.6H8.4a2.6 2.6 0 0 1-2.6-2.6V8.8a2.6 2.6 0 0 1 2.6-2.6Zm0 1.3A1.3 1.3 0 0 0 7.1 8.8v6.4a1.3 1.3 0 0 0 1.3 1.3h7.2a1.3 1.3 0 0 0 1.3-1.3V8.8a1.3 1.3 0 0 0-1.3-1.3H8.4Z' },
  { label: 'WhatsApp', href: '#', path: 'M12 5.5A6.4 6.4 0 0 0 6.3 15l-.8 3 3.1-.8A6.4 6.4 0 1 0 12 5.5Zm0 1.3a5.1 5.1 0 0 1 0 10.2 5 5 0 0 1-2.6-.7l-.2-.1-1.5.4.4-1.5-.1-.2a5.1 5.1 0 0 1 4-8.1Zm-1.7 2.4c-.1-.3-.2-.3-.4-.3h-.3a.7.7 0 0 0-.5.2c-.2.2-.6.6-.6 1.4s.6 1.6.7 1.7c.1.2 1.2 1.9 3 2.6 1.5.6 1.8.5 2.1.4.3 0 1-.4 1.1-.8.2-.4.2-.7.1-.8l-.4-.2-1-.5c-.2 0-.3-.1-.4.1l-.5.6c-.1.1-.2.2-.4.1a4.2 4.2 0 0 1-1.2-.8 4.6 4.6 0 0 1-.9-1.1c0-.2 0-.3.1-.4l.3-.3.2-.3v-.3l-.5-1.2Z' },
];

function FooterCol({ title, children }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h4 className="font-serif text-sm uppercase tracking-[0.2em]" style={{ color: 'var(--gold)' }}>
        {title}
      </h4>
      <div className="flex flex-col gap-2 text-sm text-white/65 [&_a]:transition-colors [&_a:hover]:text-[color:var(--gold)]">
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories')
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setCategories((rows.length ? rows : PLACEHOLDER_CATEGORIES).slice(0, 5));
      })
      .catch(() => setCategories(PLACEHOLDER_CATEGORIES.slice(0, 5)));
  }, []);

  return (
    <footer className="text-white" style={{ backgroundColor: 'var(--bg-dark)' }}>
      {/* Ticket-stub dashed edge */}
      <div
        aria-hidden="true"
        className="h-2"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, var(--copper) 0 10px, transparent 10px 20px)',
        }}
      />

      <div className="mx-auto max-w-[1200px] px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link to="/" className="inline-block">
              <img
                src="/images/joker/logo-footer.webp"
                alt={STORE_NAME}
                className="h-28 w-auto"
                loading="lazy"
              />
            </Link>
            <p className="font-fell mt-4 max-w-xs text-sm text-white/60">
              {t('home.seoDescription')}
            </p>
            <div className="mt-5 flex gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="inline-flex size-9 items-center justify-center border border-white/15 text-white transition-colors hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <FooterCol title={t('footer.shop')}>
            <Link to="/products">{t('products.allProducts')}</Link>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/products?category=${encodeURIComponent(cat.name)}`}>
                {localizedName(cat)}
              </Link>
            ))}
          </FooterCol>

          <FooterCol title={t('common.account')}>
            <Link to="/cart">{t('common.cart')}</Link>
            <Link to="/orders">{t('common.products')}</Link>
            <Link to="/profile">{t('common.profile')}</Link>
            <Link to="/wishlist">{t('common.wishlist')}</Link>
          </FooterCol>

          <FooterCol title={t('footer.company')}>
            <Link to="/about">{t('footer.aboutUs')}</Link>
            <Link to="/contact">{t('footer.contactUs')}</Link>
            {B2B_ENABLED && <Link to="/wholesale">{t('common.wholesale')}</Link>}
            <Link to="/privacy-policy">{t('footer.privacyPolicy')}</Link>
            <Link to="/terms">{t('footer.terms')}</Link>
          </FooterCol>

          <FooterCol title={t('footer.support')}>
            <Link to="/shipping-policy">{t('footer.shippingPolicy')}</Link>
            <Link to="/refund-policy">{t('footer.refundPolicy')}</Link>
            <Link to="/return-policy">{t('footer.returnPolicy')}</Link>
          </FooterCol>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {PAYMENTS.map((p) => (
            <span
              key={p}
              className="border border-white/20 px-3 py-1.5 text-[11px] uppercase tracking-wider text-white/50"
            >
              {p}
            </span>
          ))}
        </div>

        <hr className="my-7 border-t border-white/10" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-white/50 sm:flex-row">
          <span>{t('footer.copyright', { year: new Date().getFullYear(), store: STORE_NAME })}</span>
          <span className="flex gap-3">
            <Link to="/privacy-policy" className="transition-colors hover:text-[color:var(--gold)]">
              {t('footer.privacyPolicy')}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms" className="transition-colors hover:text-[color:var(--gold)]">
              {t('footer.terms')}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
