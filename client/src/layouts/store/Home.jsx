import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Flame, Sparkles, Droplets, Feather, Wind, Gift, Package,
  MessageCircle, Check, Quote,
} from 'lucide-react';
import api from '../../api/axios';
import { localizedName } from '../../utils/i18nHelpers';
import { CurrencySymbol, formatPrice } from '../../utils/currency';
import SEO from '../../components/SEO';
import ProductCard from './ProductCard';
import { textColor, buttonColor } from '../../utils/heroStyles';
import {
  PLACEHOLDER_BANNER, PLACEHOLDER_CATEGORIES, PLACEHOLDER_PRODUCTS,
  PLACEHOLDER_REVIEWS, PLACEHOLDER_GIFT_FROM,
} from '../../utils/placeholders';
import { Skeleton } from '@/components/ui/skeleton';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

// Per-category flourish shown under each "act" tile. Falls back to a generic
// line for categories the store adds later.
const ACT_TAGLINES = {
  'Oud & Bakhoor': 'Smoke. Ritual. Presence.',
  'Eau de Parfum': 'Bold. Commanding.',
  'Attar & Oils': 'Traditional. Pure.',
  Musk: 'Soft. Enduring.',
  'Body Mist': 'Light. Everyday.',
  'Gift Sets': 'Curated. Ready.',
};

const ACT_ICONS = [
  [/oud|bakhoor|incense/i, Flame],
  [/parfum|edp|perfume/i, Sparkles],
  [/attar|oil/i, Droplets],
  [/musk/i, Feather],
  [/mist|body/i, Wind],
  [/gift|set/i, Gift],
];
function iconFor(name = '') {
  for (const [re, Icon] of ACT_ICONS) if (re.test(name)) return Icon;
  return Package;
}

/* ── Small shared ornaments ─────────────────────────────────────────── */

function Eyebrow({ children, className = '' }) {
  return (
    <p
      className={`font-serif text-xs uppercase tracking-[0.3em] ${className}`}
      style={{ color: 'var(--copper)' }}
    >
      {children}
    </p>
  );
}

/* ── 1. Hero ────────────────────────────────────────────────────────── */

// One hero CTA. Internal paths route through <Link>; hashes, external URLs and
// mailto/tel fall back to a plain anchor so in-page jumps keep working.
function HeroButton({ label, link, bg, fg, arrow }) {
  if (!label) return null;
  const className = 'px-8 py-3.5 font-serif text-sm uppercase tracking-[0.2em] transition-opacity hover:opacity-85';
  // Arrow inherits `color`, so it always matches the label per the spec.
  const style = { backgroundColor: buttonColor(bg), color: textColor(fg) };
  // `undefined` means the banner predates the toggle — keep the arrow.
  const content = arrow === false ? label : <>{label} <span aria-hidden="true">→</span></>;
  const to = link || '/products';

  if (/^(https?:|#|mailto:|tel:)/.test(to)) {
    return <a href={to} className={className} style={style}>{content}</a>;
  }
  return <Link to={to} className={className} style={style}>{content}</Link>;
}

function Hero({ banner }) {
  const b = banner || {};

  return (
    <section className="relative overflow-hidden border-y-[3px] border-foreground bg-foreground">
      <picture>
        {b.mobileImage && <source media="(max-width: 640px)" srcSet={b.mobileImage} />}
        <img
          src={b.image || '/images/joker/hero-circus.webp'}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
          fetchPriority="high"
        />
      </picture>

      <div className="relative mx-auto flex min-h-[520px] max-w-[1200px] flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[600px] lg:min-h-[650px]">
        {b.eyebrow && (
          <p
            className="font-serif text-xs uppercase tracking-[0.3em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
            style={{ color: 'var(--gold)' }}
          >
            {b.eyebrow}
          </p>
        )}

        {/* Content is whatever Admin → Theme → Home Banner holds — no hardcoded
            copy, so an empty field in the editor renders as nothing here rather
            than silently falling back to placeholder text. */}
        {b.title && (
          <h1
            className="mt-4 font-serif text-5xl uppercase leading-[0.95] tracking-wide drop-shadow-[0_2px_14px_rgba(0,0,0,0.5)] sm:text-6xl lg:text-7xl"
            style={{ color: textColor(b.titleColor) }}
          >
            {b.title}
          </h1>
        )}

        {b.subtitle && (
          <p
            className="font-fell mt-5 max-w-md text-base drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)] sm:text-lg"
            style={{ color: textColor(b.subtitleColor) }}
          >
            {b.subtitle}
          </p>
        )}

        {(b.btn1Label || b.btn2Label) && (
          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <HeroButton label={b.btn1Label} link={b.btn1Link} bg={b.btn1Bg} fg={b.btn1Fg} arrow={b.btn1Arrow} />
            <HeroButton label={b.btn2Label} link={b.btn2Link} bg={b.btn2Bg} fg={b.btn2Fg} arrow={b.btn2Arrow} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ── 2. Choose your act (categories) ────────────────────────────────── */

function ChooseYourAct({ categories }) {
  const { t } = useTranslation();
  if (!categories.length) return null;
  const acts = categories.slice(0, 6);

  return (
    <section id="choose-your-act" className="scroll-mt-24 bg-background px-4 py-14">
      {/* Double frame from the design: thick gold band outside, thin black
          rule inside. Two nested elements rather than `border: double`, which
          can't take two colours. */}
      <div className="mx-auto max-w-[1200px]" style={{ border: '6px solid var(--copper)' }}>
        <div
          className="bg-card p-6 sm:p-10"
          style={{ border: '2px solid var(--text)' }}
        >
        <div className="text-center">
          <Eyebrow>
            ✦ {t('joker.acts.eyebrow', { defaultValue: "Tonight's Performance Schedule" })}
          </Eyebrow>
          <h2 className="mt-3 font-serif text-4xl uppercase tracking-wide text-foreground sm:text-5xl">
            {t('joker.acts.title', { defaultValue: 'Choose Your' })}{' '}
            <span style={{ color: 'var(--danger)' }}>
              {t('joker.acts.titleAccent', { defaultValue: 'Act' })}
            </span>
          </h2>
          <p className="font-elite mt-2 text-sm text-muted-foreground">
            {t('joker.acts.sub', { defaultValue: 'Every performer has a signature. Find yours.' })}
          </p>
        </div>

        <hr className="my-7 border-t-[3px] border-foreground" />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {acts.map((c, i) => {
            const Icon = iconFor(c.name);
            return (
              <Link
                key={c.id || c.name}
                to={`/products?category=${encodeURIComponent(c.name)}`}
                className="group flex flex-col gap-2 border border-border p-3 transition-colors hover:border-[color:var(--danger)] hover:bg-[color:var(--bg-warm)]"
              >
                <span className="font-serif text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {t('joker.acts.act', { defaultValue: 'Act' })} {ROMAN[i]}
                </span>
                <Icon className="size-5 text-foreground" strokeWidth={1.5} />
                <span className="font-serif text-base uppercase leading-tight tracking-wide text-foreground">
                  {localizedName(c)}
                </span>
                <span className="font-fell text-xs text-muted-foreground">
                  {ACT_TAGLINES[c.name] || t('joker.acts.fallback', { defaultValue: 'Step into the ring.' })}
                </span>
              </Link>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}

/* ── 4. Crowd favourites (featured products) ────────────────────────── */

function CrowdFavourites({ products, loading }) {
  const { t } = useTranslation();
  return (
    <section className="bg-[color:var(--bg-warm)] px-4 py-14">
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center">
          <Eyebrow>★ {t('joker.crowd.eyebrow', { defaultValue: 'The Star Acts' })}</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl uppercase tracking-wide text-foreground sm:text-5xl">
            {t('joker.crowd.title', { defaultValue: 'Crowd Favourites' })}
          </h2>
          <p className="font-fell mt-2 text-sm text-muted-foreground">
            {t('joker.crowd.sub', { defaultValue: 'Loved hard. For good reason.' })}
          </p>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-[4/5] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))
            : products.slice(0, 5).map((p, i) => (
                <ProductCard key={p.id} product={p} eager={i < 3} />
              ))}
        </div>

        <div className="mt-9 text-center">
          <Link
            to="/products"
            className="inline-block px-10 py-3 font-serif text-sm uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--copper)' }}
          >
            {t('common.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 5. Scent quiz teaser ───────────────────────────────────────────── */

function ScentQuiz() {
  const { t } = useTranslation();
  return (
    <section className="bg-background px-4 py-14">
      <div
        className="relative mx-auto max-w-[1200px] overflow-hidden bg-card p-8 sm:p-12"
        style={{ border: '1px solid var(--copper)' }}
      >
        {/* Faint concentric "crystal ball" line art, decorative only */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-1/2 hidden size-[420px] -translate-y-1/2 rounded-full opacity-30 lg:block"
          style={{ border: '1px solid var(--copper)' }}
        >
          <div className="absolute inset-8 rounded-full" style={{ border: '1px solid var(--copper)' }} />
          <div className="absolute inset-20 rounded-full" style={{ border: '1px solid var(--copper)' }} />
        </div>

        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <Eyebrow>{t('joker.quiz.eyebrow', { defaultValue: "The Oracle's Tent" })}</Eyebrow>
            <h2 className="mt-3 font-serif text-4xl uppercase leading-[0.95] tracking-wide text-foreground sm:text-5xl">
              {t('joker.quiz.title1', { defaultValue: "Don't Know" })}
              <br />
              {t('joker.quiz.title2', { defaultValue: 'Your Scent?' })}
            </h2>
            <p className="font-fell mt-3 text-3xl italic sm:text-4xl" style={{ color: 'var(--copper)' }}>
              {t('joker.quiz.tagline', { defaultValue: 'Let us read you.' })}
            </p>
            <p className="font-fell mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t('joker.quiz.body', {
                defaultValue:
                  'Answer 5 questions. We reveal the fragrance written in your stars — no guesswork, no regrets.',
              })}
            </p>
          </div>

          <Link
            to="/products"
            className="justify-self-start bg-foreground px-8 py-3.5 font-serif text-sm uppercase tracking-[0.2em] text-white transition-colors hover:bg-[color:var(--copper)] lg:justify-self-center"
          >
            {t('joker.quiz.cta', { defaultValue: 'Begin the Reading' })} →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 6. Festival gift booth ─────────────────────────────────────────── */

function GiftBooth({ fromPrice }) {
  const { t } = useTranslation();
  const perks = [
    t('joker.gift.perk1', { defaultValue: 'Free premium gift wrapping' }),
    t('joker.gift.perk2', { defaultValue: 'Personalised message card' }),
    t('joker.gift.perk3', { defaultValue: 'Express delivery available' }),
  ];
  return (
    <section>
      <div className="bg-foreground py-3 text-center">
        <span className="font-serif text-sm uppercase tracking-[0.3em]" style={{ color: 'var(--gold)' }}>
          ★ {t('joker.gift.banner', { defaultValue: 'Festival Gift Booth' })} ★
        </span>
      </div>

      <div className="bg-background px-4 py-12 text-center">
        <div className="mx-auto max-w-[1200px]">
          <Eyebrow>✦ {t('joker.gift.eyebrow', { defaultValue: 'Eid Festival Collection' })}</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl uppercase tracking-wide text-foreground sm:text-5xl">
            {t('joker.gift.title', { defaultValue: 'Festival Gift Sets.' })}
          </h2>
          {fromPrice != null && (
            <p className="font-fell mt-1 text-2xl italic" style={{ color: 'var(--danger)' }}>
              {t('joker.gift.from', { defaultValue: 'Starting from' })}{' '}
              <CurrencySymbol />{formatPrice(fromPrice)}
            </p>
          )}

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {perks.map((p) => (
              <div key={p} className="flex items-center justify-center gap-2">
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: 'var(--copper)' }}
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <span className="text-sm text-muted-foreground">{p}</span>
              </div>
            ))}
          </div>

          <Link
            to="/products?category=Gift%20Sets"
            className="mt-8 inline-block bg-foreground px-8 py-3.5 font-serif text-sm uppercase tracking-[0.2em] transition-colors hover:bg-[color:var(--copper)] hover:text-white"
            style={{ color: 'var(--gold)' }}
          >
            {t('joker.gift.cta', { defaultValue: 'Claim Your Gift Set' })} →
          </Link>
        </div>
      </div>
      <hr className="border-t border-foreground" />
    </section>
  );
}

/* ── 7. Testimonials ────────────────────────────────────────────────── */

// Shortens "Faisal Al Harbi" to "Faisal A." so the card keeps its shape
// regardless of how long a reviewer's full name is.
function shortName(full = '') {
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return full;
  return `${parts[0]} ${parts[1][0]}.`;
}

function RealReactions({ reviews }) {
  const { t } = useTranslation();
  // Nothing to show until the store has approved reviews — better an absent
  // section than three empty cards.
  if (!reviews.length) return null;

  return (
    <section className="bg-background">
      {/* Silhouetted audience divider */}
      <img
        src="/images/joker/wall-bg.webp"
        alt=""
        aria-hidden="true"
        className="h-24 w-full object-cover opacity-60"
        loading="lazy"
      />

      <div className="mx-auto max-w-[1200px] px-4 pb-14">
        <div className="text-center">
          <Eyebrow>{t('joker.reactions.eyebrow', { defaultValue: 'The Crowd Says' })}</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl uppercase tracking-wide text-foreground sm:text-5xl">
            {t('joker.reactions.title', { defaultValue: 'Real Reactions.' })}
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.id} className="relative border border-border bg-card p-5 pt-6">
              {/* Circus-stripe top edge */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1.5"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(90deg, var(--danger) 0 8px, #ffffff 8px 16px)',
                }}
              />
              <div className="flex items-start justify-between gap-2">
                <Quote className="size-6 shrink-0 text-muted-foreground/30" />
                <span className="text-sm" style={{ color: 'var(--gold)' }} aria-label={`${r.rating} out of 5`}>
                  {'★'.repeat(r.rating)}<span className="opacity-25">{'★'.repeat(5 - r.rating)}</span>
                </span>
              </div>
              <blockquote className="font-fell mt-2 text-sm italic leading-relaxed text-foreground">
                {r.comment}
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                  {r.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {shortName(r.name)}
                  </span>
                  {r.Product?.slug ? (
                    <Link
                      to={`/product/${r.Product.slug}`}
                      className="block truncate text-[11px] text-muted-foreground transition-colors hover:text-[color:var(--copper)]"
                    >
                      {r.Product.name}
                    </Link>
                  ) : null}
                </span>
                {r.verified && (
                  <span
                    className="flex shrink-0 items-center gap-1 text-[11px]"
                    style={{ color: 'var(--success)' }}
                  >
                    <Check className="size-3" strokeWidth={3} />
                    {t('joker.reactions.verified', { defaultValue: 'Verified' })}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 8. Ringmaster manifesto ────────────────────────────────────────── */

function Ringmaster() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden bg-background px-4 py-16 text-center">
      {/* Spotlight cone */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-full w-[520px] -translate-x-1/2"
        style={{
          background: 'linear-gradient(to bottom, color-mix(in srgb, var(--gold) 18%, transparent), transparent 70%)',
          clipPath: 'polygon(42% 0, 58% 0, 88% 100%, 12% 100%)',
        }}
      />
      <div className="relative mx-auto max-w-[1200px]">
        <p className="text-sm" style={{ color: 'var(--gold)' }}>✦ ✦ ✦</p>
        <Eyebrow className="mt-3">
          {t('joker.ringmaster.eyebrow', { defaultValue: 'The Ringmaster Speaks' })}
        </Eyebrow>
        <h2 className="mt-4 font-serif text-4xl uppercase leading-[1.05] tracking-wide text-foreground sm:text-5xl">
          {t('joker.ringmaster.line1', { defaultValue: 'The Show' })}
          <br />
          {t('joker.ringmaster.line2', { defaultValue: 'Must Always' })}
          <br />
          <span style={{ color: 'var(--copper)' }}>
            {t('joker.ringmaster.line3', { defaultValue: 'Smell Good.' })}
          </span>
        </h2>
        <p className="font-fell mx-auto mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
          {t('joker.ringmaster.body', {
            defaultValue:
              'Premium Arabic fragrances, officially imported and authenticated for Saudi Arabia. Every bottle is real. Every scent — unforgettable.',
          })}
        </p>
        <hr className="mx-auto mt-8 max-w-2xl border-t border-border" />
        <p className="font-fell mt-6 text-lg italic" style={{ color: 'var(--copper)' }}>
          — {t('joker.ringmaster.sign', { defaultValue: 'The House of Joker' })}
        </p>
      </div>
    </section>
  );
}

/* ── 9. Inner circle newsletter ─────────────────────────────────────── */

function InnerCircle() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <section className="px-4 py-14" style={{ backgroundColor: 'var(--bg-warm)' }}>
      <div className="mx-auto max-w-[1200px] p-3" style={{ backgroundColor: 'var(--copper)' }}>
        <div className="bg-card px-6 py-10 text-center sm:px-12">
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--danger)' }}>
            ✦ {t('joker.inner.eyebrow', { defaultValue: 'Inner Circle · Exclusive Access' })} ✦
          </p>

          <h2 className="mt-4 font-serif text-3xl uppercase leading-tight tracking-wide text-foreground sm:text-4xl">
            {t('joker.inner.get', { defaultValue: 'Get' })}{' '}
            <span style={{ color: 'var(--copper)' }}>
              <CurrencySymbol />{formatPrice(50)}
            </span>{' '}
            {t('joker.inner.off', { defaultValue: 'Off' })}
            <br />
            {t('joker.inner.firstOrder', { defaultValue: 'Your First Order' })}
          </h2>

          <hr className="my-6 border-t border-foreground" />
          <p className="font-elite text-xs text-muted-foreground">
            {t('joker.inner.join', { defaultValue: 'join the circus' })}
          </p>

          {sent ? (
            <p className="mt-5 font-serif text-lg uppercase tracking-wide" style={{ color: 'var(--copper)' }}>
              {t('newsletter.thanks')}
            </p>
          ) : (
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <form
                onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSent(true); }}
                className="flex w-full max-w-sm items-stretch border border-border"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('newsletter.placeholder')}
                  className="min-w-0 flex-1 bg-background px-4 py-3 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-foreground px-5 font-serif text-sm uppercase tracking-[0.15em]"
                  style={{ color: 'var(--gold)' }}
                >
                  {t('joker.inner.claim', { defaultValue: 'Claim' })}
                </button>
              </form>

              <a
                href="https://wa.me/966500000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full max-w-sm items-center justify-center gap-2 px-6 py-3 font-serif text-sm uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90 sm:w-auto"
                style={{ backgroundColor: '#25d366' }}
              >
                <MessageCircle className="size-4" />
                {t('joker.inner.whatsapp', { defaultValue: 'Connect on WhatsApp' })}
              </a>
            </div>
          )}
        </div>

        <p
          className="font-elite mt-3 px-4 py-3 text-center text-sm"
          style={{ backgroundColor: 'var(--bg-warm)', color: 'var(--text)' }}
        >
          {t('joker.inner.footnote', {
            defaultValue: "Early access to new drops & festival collections. Don't miss the next show.",
          })}
        </p>
      </div>
    </section>
  );
}

/* ── Page ───────────────────────────────────────────────────────────── */

export default function Home() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [giftFrom, setGiftFrom] = useState(null);
  const [loading, setLoading] = useState(true);
  // The first configured banner drives the hero; null falls back to the
  // built-in circus artwork and default copy.
  const [heroBanner, setHeroBanner] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Every fetch below falls back to placeholder content when the API is
    // unreachable or returns nothing, so a backend-less demo still renders a
    // complete page. A successful response is always used as-is — including
    // when a field is deliberately empty.
    api.get('/reviews/top?limit=3')
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setReviews(rows.length ? rows : PLACEHOLDER_REVIEWS);
      })
      .catch(() => setReviews(PLACEHOLDER_REVIEWS));

    api.get('/settings/banners')
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setHeroBanner(rows.length ? rows[0] : PLACEHOLDER_BANNER);
      })
      .catch(() => setHeroBanner(PLACEHOLDER_BANNER));

    api.get('/categories')
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setCategories(rows.length ? rows : PLACEHOLDER_CATEGORIES);
      })
      .catch(() => setCategories(PLACEHOLDER_CATEGORIES));

    api.get('/products?featured=true&limit=10')
      .then((res) => {
        const rows = res.data?.products || [];
        setFeatured(rows.length ? rows : PLACEHOLDER_PRODUCTS);
      })
      .catch(() => setFeatured(PLACEHOLDER_PRODUCTS))
      .finally(() => setLoading(false));

    // Cheapest gift set drives the "starting from" line.
    api.get('/products?category=Gift%20Sets&limit=50')
      .then((res) => {
        const prices = (res.data?.products || []).map((p) => Number(p.price)).filter(Number.isFinite);
        setGiftFrom(prices.length ? Math.min(...prices) : PLACEHOLDER_GIFT_FROM);
      })
      .catch(() => setGiftFrom(PLACEHOLDER_GIFT_FROM));
  }, []);

  return (
    <div>
      <SEO title={t('home.seoTitle')} description={t('home.seoDescription')} />
      <Hero banner={heroBanner} />
      <ChooseYourAct categories={categories} />
      <CrowdFavourites products={featured} loading={loading} />
      <ScentQuiz />
      <GiftBooth fromPrice={giftFrom} />
      <RealReactions reviews={reviews} />
      <Ringmaster />
      <InnerCircle />
    </div>
  );
}
