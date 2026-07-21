/**
 * Fallback content for when the API is unreachable (demo deploys with no
 * backend, or a DB outage) so the storefront still renders a complete page
 * instead of collapsing to empty sections.
 *
 * IMPORTANT: these are a fallback for *missing data*, not defaults that mask
 * configured values. A request that succeeds and returns an explicitly empty
 * field must keep rendering nothing — clearing a hero title in Admin has to
 * clear it on the page. Only a failed request, or a response with no rows at
 * all, falls through to the placeholders below.
 *
 * Images point at bundled assets under /images/joker/ rather than /uploads,
 * because uploads are served by Express and will not exist on a static deploy.
 */

const BOTTLES = [
  '/images/joker/bottle-1.webp',
  '/images/joker/bottle-2.webp',
  '/images/joker/bottle-3.webp',
  '/images/joker/bottle-4.webp',
];

export const PLACEHOLDER_ANNOUNCEMENTS = [
  'Free Shipping Above SAR 200',
  '100% Authentic · Officially Imported',
];

export const PLACEHOLDER_BANNER = {
  image: '/images/joker/hero-circus.webp',
  mobileImage: '',
  eyebrow: 'The Grand Olfactory Circus',
  title: 'Command the Stage',
  subtitle: 'Perfumes that command every room. No apologies. No forgettable moments.',
  titleColor: 'white',
  subtitleColor: 'white',
  btn1Label: 'Enter the Circus',
  btn1Link: '/products',
  btn1Bg: 'black',
  btn1Fg: 'white',
  btn1Arrow: true,
  btn2Label: 'Find My Signature Scent',
  btn2Link: '#choose-your-act',
  btn2Bg: 'white',
  btn2Fg: 'black',
  btn2Arrow: true,
};

export const PLACEHOLDER_CATEGORIES = [
  { id: -1, name: 'Oud & Bakhoor', nameAr: 'العود والبخور', active: true, sortOrder: 1 },
  { id: -2, name: 'Eau de Parfum', nameAr: 'أو دو بارفان', active: true, sortOrder: 2 },
  { id: -3, name: 'Attar & Oils', nameAr: 'العطور الزيتية', active: true, sortOrder: 3 },
  { id: -4, name: 'Musk', nameAr: 'المسك', active: true, sortOrder: 4 },
  { id: -5, name: 'Body Mist', nameAr: 'معطر الجسم', active: true, sortOrder: 5 },
  { id: -6, name: 'Gift Sets', nameAr: 'أطقم الهدايا', active: true, sortOrder: 6 },
];

// GET /products/categories returns bare strings, not rows — a different shape
// from GET /categories above, so it needs its own placeholder.
export const PLACEHOLDER_CATEGORY_NAMES = PLACEHOLDER_CATEGORIES.map((c) => c.name);

const product = (id, slug, name, brand, category, price, comparePrice, ratings, featured) => ({
  id, slug, name, brand, category, price, comparePrice, ratings,
  featured, stock: 25, numReviews: 40, images: [BOTTLES[Math.abs(id) % BOTTLES.length]],
});

export const PLACEHOLDER_PRODUCTS = [
  product(-101, 'royal-oud-cambodi', 'Royal Oud Cambodi', 'Joker Signature', 'Oud & Bakhoor', 480, 620, 4.9, true),
  product(-102, 'oud-muattar-blend', 'Oud Muattar Blend', 'Joker Signature', 'Oud & Bakhoor', 265, 330, 4.7, true),
  product(-103, 'joker-noir-edp-100ml', 'Joker Noir Eau de Parfum 100ml', 'Joker Signature', 'Eau de Parfum', 420, 550, 4.9, true),
  product(-104, 'velvet-rose-absolute-75ml', 'Velvet Rose Absolute 75ml', 'Maison Joker', 'Eau de Parfum', 345, 430, 4.7, true),
  product(-105, 'saffron-oud-intense-50ml', 'Saffron Oud Intense 50ml', 'Joker Signature', 'Eau de Parfum', 520, 640, 4.8, true),
  product(-106, 'attar-mukhallat-malaki-12ml', 'Attar Mukhallat Malaki 12ml', 'Joker Signature', 'Attar & Oils', 290, 360, 4.8, true),
  product(-107, 'white-musk-tahara-30ml', 'White Musk Tahara 30ml', 'Dar Al Joker', 'Musk', 120, 160, 4.6, true),
  product(-108, 'joker-noir-body-mist-250ml', 'Joker Noir Body Mist 250ml', 'Joker Signature', 'Body Mist', 95, 130, 4.5, true),
  product(-109, 'joker-discovery-set-5x10ml', 'Joker Discovery Set — 5 x 10ml', 'Joker Signature', 'Gift Sets', 320, 450, 4.8, true),
  product(-110, 'oud-ritual-gift-box', 'Oud Ritual Gift Box', 'Dar Al Joker', 'Gift Sets', 445, 600, 4.7, true),
];

// Cheapest gift set, mirroring what the live "starting from" line computes.
export const PLACEHOLDER_GIFT_FROM = 320;

export const PLACEHOLDER_REVIEWS = [
  {
    id: -1, name: 'Faisal Al Harbi', rating: 5, verified: true,
    comment: "Lasts all day in Riyadh's summer heat. Got compliments from four strangers in one evening.",
    Product: { name: 'Joker Noir Eau de Parfum 100ml', slug: 'joker-noir-edp-100ml' },
  },
  {
    id: -2, name: 'Noura Al Saud', rating: 5, verified: true,
    comment: 'Ordered as an Eid gift and the wrapping alone was worth it. The oud is the real thing.',
    Product: { name: 'Oud Ritual Gift Box', slug: 'oud-ritual-gift-box' },
  },
  {
    id: -3, name: 'Khalid Al Mutairi', rating: 5, verified: true,
    comment: 'I have worn niche fragrances for years. Two sprays of this outlasts a full bottle of anything else.',
    Product: { name: 'Saffron Oud Intense 50ml', slug: 'saffron-oud-intense-50ml' },
  },
];
