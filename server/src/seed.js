import dotenv from 'dotenv';
dotenv.config();

import sequelize from './config/database.js';
import { User, Product, Category, Setting, Review } from './models/index.js';

// Category display order + Arabic names. Products reference these by name.
const categories = [
  { name: 'Oud & Bakhoor', nameAr: 'العود والبخور' },
  { name: 'Eau de Parfum', nameAr: 'أو دو بارفان' },
  { name: 'Attar & Oils', nameAr: 'العطور الزيتية' },
  { name: 'Musk', nameAr: 'المسك' },
  { name: 'Body Mist', nameAr: 'معطر الجسم' },
  { name: 'Gift Sets', nameAr: 'أطقم الهدايا' },
];

const products = [
  // Oud & Bakhoor
  {
    name: 'Royal Oud Cambodi',
    nameAr: 'العود الكمبودي الملكي',
    slug: 'royal-oud-cambodi',
    code: 'JP-OUD-001',
    description: 'Aged Cambodian oud wood chips with a sweet, resinous smoke and a long woody trail. Hand-selected from mature agarwood and rested for three years before packing. 12g tin.',
    descriptionAr: 'رقائق العود الكمبودي المعتق بدخان راتنجي حلو وأثر خشبي طويل. منتقى يدوياً من خشب العود الناضج ومعتق ثلاث سنوات. علبة 12 جرام.',
    price: 480.0, comparePrice: 620.0, costPrice: 260.0,
    category: 'Oud & Bakhoor', brand: 'Joker Signature', stock: 24,
    images: [], featured: true, ratings: 4.9, numReviews: 86,
    taxable: true, taxRate: 15, weight: 0.05,
  },
  {
    name: 'Oud Muattar Blend',
    nameAr: 'عود معطر',
    slug: 'oud-muattar-blend',
    code: 'JP-OUD-002',
    description: 'Traditional muattar — oud chips marinated in rose, amber and sandalwood oils, then slow-cured. Fills a majlis within minutes. 40g jar.',
    descriptionAr: 'عود معطر تقليدي منقوع بزيوت الورد والعنبر والصندل ثم معالج ببطء. يعطر المجلس خلال دقائق. برطمان 40 جرام.',
    price: 265.0, comparePrice: 330.0, costPrice: 140.0,
    category: 'Oud & Bakhoor', brand: 'Joker Signature', stock: 40,
    images: [], featured: true, ratings: 4.7, numReviews: 142,
    taxable: true, taxRate: 15, weight: 0.09,
  },
  {
    name: 'Bakhoor Layali Riyadh',
    nameAr: 'بخور ليالي الرياض',
    slug: 'bakhoor-layali-riyadh',
    code: 'JP-OUD-003',
    description: 'Smooth bakhoor bricks of sandalwood, vanilla and white musk. Lighter than pure oud smoke, ideal for daily use in bedrooms and wardrobes. Box of 10 pieces.',
    descriptionAr: 'قطع بخور ناعمة من الصندل والفانيليا والمسك الأبيض. أخف من دخان العود الصافي ومثالي للاستخدام اليومي. علبة 10 قطع.',
    price: 95.0, comparePrice: 130.0, costPrice: 42.0,
    category: 'Oud & Bakhoor', brand: 'Dar Al Joker', stock: 120,
    images: [], featured: false, ratings: 4.5, numReviews: 208,
    taxable: true, taxRate: 15, weight: 0.12,
  },
  {
    name: 'Oud Hindi Superior',
    nameAr: 'عود هندي فاخر',
    slug: 'oud-hindi-superior',
    code: 'JP-OUD-004',
    description: 'Deep, animalic Indian oud for connoisseurs. A sharp opening that settles into warm leather and dried fruit. Not for the faint-hearted. 10g tin.',
    descriptionAr: 'عود هندي عميق وقوي لعشاق العود الأصيل. بداية حادة تهدأ إلى جلد دافئ وفواكه مجففة. علبة 10 جرام.',
    price: 690.0, comparePrice: 850.0, costPrice: 380.0,
    category: 'Oud & Bakhoor', brand: 'Joker Signature', stock: 12,
    images: [], featured: false, ratings: 4.8, numReviews: 47,
    taxable: true, taxRate: 15, weight: 0.04,
  },
  {
    name: 'Electric Bakhoor Burner — Matte Black',
    nameAr: 'مبخرة كهربائية — أسود مطفي',
    slug: 'electric-bakhoor-burner-matte-black',
    code: 'JP-ACC-001',
    description: 'USB-C rechargeable bakhoor burner with three heat settings and a removable ceramic plate. Two-hour runtime, no charcoal and no ash.',
    descriptionAr: 'مبخرة كهربائية قابلة للشحن بمنفذ USB-C مع ثلاث درجات حرارة وصحن سيراميك قابل للإزالة. تعمل ساعتين بدون فحم أو رماد.',
    price: 179.0, comparePrice: 249.0, costPrice: 88.0,
    category: 'Oud & Bakhoor', brand: 'Dar Al Joker', stock: 65,
    images: [], featured: true, ratings: 4.4, numReviews: 173,
    taxable: true, taxRate: 15, weight: 0.45,
  },

  // Eau de Parfum
  {
    name: 'Joker Noir Eau de Parfum 100ml',
    nameAr: 'جوكر نوار او دو بارفان ١٠٠ مل',
    slug: 'joker-noir-edp-100ml',
    code: 'JP-EDP-001',
    description: 'The house signature. Black pepper and bergamot open onto a heart of oud and Turkish rose, drying down to leather, amber and tonka. Twelve-hour projection.',
    descriptionAr: 'عطر الدار المميز. فلفل أسود وبرغموت يفتحان على قلب من العود والورد التركي، وينتهي بالجلد والعنبر والتونكا. ثبات حتى ١٢ ساعة.',
    price: 420.0, comparePrice: 550.0, costPrice: 195.0,
    category: 'Eau de Parfum', brand: 'Joker Signature', stock: 58,
    images: [], featured: true, ratings: 4.9, numReviews: 312,
    taxable: true, taxRate: 15, weight: 0.38,
  },
  {
    name: 'Velvet Rose Absolute 75ml',
    nameAr: 'فيلفيت روز ابسولوت ٧٥ مل',
    slug: 'velvet-rose-absolute-75ml',
    code: 'JP-EDP-002',
    description: 'Taif rose absolute layered over raspberry, patchouli and white musk. Rich and feminine without turning powdery. A modern take on the classic Arabian rose.',
    descriptionAr: 'ورد الطائف المركز فوق التوت والباتشولي والمسك الأبيض. غني وأنثوي دون أن يكون بودري. رؤية عصرية للورد العربي الكلاسيكي.',
    price: 345.0, comparePrice: 430.0, costPrice: 160.0,
    category: 'Eau de Parfum', brand: 'Maison Joker', stock: 44,
    images: [], featured: true, ratings: 4.7, numReviews: 189,
    taxable: true, taxRate: 15, weight: 0.31,
  },
  {
    name: 'Amber Sultan 100ml',
    nameAr: 'عنبر سلطان ١٠٠ مل',
    slug: 'amber-sultan-100ml',
    code: 'JP-EDP-003',
    description: 'Warm ambergris and labdanum wrapped in vanilla, cinnamon and benzoin. A cold-weather scent with serious sillage and comfort.',
    descriptionAr: 'عنبر دافئ ولبدانوم ملفوف بالفانيليا والقرفة والبنزوين. عطر شتوي بفوحان قوي ودفء مريح.',
    price: 380.0, comparePrice: 470.0, costPrice: 175.0,
    category: 'Eau de Parfum', brand: 'Maison Joker', stock: 37,
    images: [], featured: false, ratings: 4.6, numReviews: 156,
    taxable: true, taxRate: 15, weight: 0.38,
  },
  {
    name: 'Blue Wave Aquatic 100ml',
    nameAr: 'بلو ويف اكواتيك ١٠٠ مل',
    slug: 'blue-wave-aquatic-100ml',
    code: 'JP-EDP-004',
    description: 'Fresh marine accord with Calabrian bergamot, sea salt and driftwood. Light enough for a Riyadh summer, sharp enough for the office.',
    descriptionAr: 'تركيبة بحرية منعشة مع برغموت كالابريا وملح البحر والخشب البحري. خفيف لصيف الرياض ومناسب للعمل.',
    price: 245.0, comparePrice: 320.0, costPrice: 105.0,
    category: 'Eau de Parfum', brand: 'Maison Joker', stock: 76,
    images: [], featured: false, ratings: 4.3, numReviews: 221,
    taxable: true, taxRate: 15, weight: 0.38,
  },
  {
    name: 'Saffron Oud Intense 50ml',
    nameAr: 'سافرون عود انتنس ٥٠ مل',
    slug: 'saffron-oud-intense-50ml',
    code: 'JP-EDP-005',
    description: 'Kashmiri saffron and nutmeg over a smoky oud base with a whisper of jasmine. Extrait strength — two sprays are enough.',
    descriptionAr: 'زعفران كشميري وجوزة الطيب فوق قاعدة عود مدخنة مع لمسة ياسمين. تركيز اكستريه — بختان تكفيان.',
    price: 520.0, comparePrice: 640.0, costPrice: 240.0,
    category: 'Eau de Parfum', brand: 'Joker Signature', stock: 29,
    images: [], featured: true, ratings: 4.8, numReviews: 134,
    taxable: true, taxRate: 15, weight: 0.24,
  },
  {
    name: 'White Tobacco Vanille 100ml',
    nameAr: 'وايت توباكو فانيليا ١٠٠ مل',
    slug: 'white-tobacco-vanille-100ml',
    code: 'JP-EDP-006',
    description: 'Cured tobacco leaf sweetened with Madagascan vanilla, dried plum and cocoa. Gourmand but never sugary. Best worn after sunset.',
    descriptionAr: 'ورق تبغ معالج مع فانيليا مدغشقر والبرقوق المجفف والكاكاو. حلو دون إفراط. يُفضل بعد الغروب.',
    price: 365.0, comparePrice: 450.0, costPrice: 168.0,
    category: 'Eau de Parfum', brand: 'Maison Joker', stock: 41,
    images: [], featured: false, ratings: 4.6, numReviews: 98,
    taxable: true, taxRate: 15, weight: 0.38,
  },
  {
    name: 'Citrus Neroli Cologne 100ml',
    nameAr: 'سيتروس نيرولي كولونيا ١٠٠ مل',
    slug: 'citrus-neroli-cologne-100ml',
    code: 'JP-EDP-007',
    description: 'Sicilian lemon, neroli and petitgrain over clean cedar. A bright everyday cologne that resets the senses. Unisex.',
    descriptionAr: 'ليمون صقلي ونيرولي وبتيتغرين فوق أرز نظيف. كولونيا يومية منعشة. للجنسين.',
    price: 210.0, comparePrice: 275.0, costPrice: 92.0,
    category: 'Eau de Parfum', brand: 'Maison Joker', stock: 88,
    images: [], featured: false, ratings: 4.4, numReviews: 167,
    taxable: true, taxRate: 15, weight: 0.38,
  },

  // Attar & Oils
  {
    name: 'Attar Mukhallat Malaki 12ml',
    nameAr: 'عطر مخلط ملكي ١٢ مل',
    slug: 'attar-mukhallat-malaki-12ml',
    code: 'JP-ATR-001',
    description: 'Alcohol-free oil blend of oud, rose, saffron and musk in a hand-blown roll-on bottle. One drop on the wrist lasts the whole day.',
    descriptionAr: 'مخلط زيتي خالٍ من الكحول من العود والورد والزعفران والمسك في زجاجة رول-أون مصنوعة يدوياً. قطرة واحدة تدوم اليوم كله.',
    price: 290.0, comparePrice: 360.0, costPrice: 130.0,
    category: 'Attar & Oils', brand: 'Joker Signature', stock: 52,
    images: [], featured: true, ratings: 4.8, numReviews: 176,
    taxable: true, taxRate: 15, weight: 0.06,
  },
  {
    name: 'Pure Sandalwood Oil 6ml',
    nameAr: 'زيت الصندل النقي ٦ مل',
    slug: 'pure-sandalwood-oil-6ml',
    code: 'JP-ATR-002',
    description: 'Steam-distilled Mysore-style sandalwood oil. Creamy, milky and meditative. Wears close to the skin — perfect as a layering base.',
    descriptionAr: 'زيت صندل مقطر بالبخار على الطريقة الميسورية. كريمي وحليبي وهادئ. قريب من البشرة ومثالي كأساس للطبقات.',
    price: 340.0, comparePrice: 420.0, costPrice: 155.0,
    category: 'Attar & Oils', brand: 'Joker Signature', stock: 33,
    images: [], featured: false, ratings: 4.7, numReviews: 91,
    taxable: true, taxRate: 15, weight: 0.04,
  },
  {
    name: 'Attar Ward Taifi 10ml',
    nameAr: 'عطر ورد طائفي ١٠ مل',
    slug: 'attar-ward-taifi-10ml',
    code: 'JP-ATR-003',
    description: 'Single-note Taif rose oil, distilled from petals picked at dawn during the short spring harvest. Honeyed, green and unmistakably Saudi.',
    descriptionAr: 'زيت ورد طائفي أحادي النوتة، مقطر من بتلات مقطوفة عند الفجر في موسم الربيع القصير. عسلي وأخضر وسعودي بامتياز.',
    price: 395.0, comparePrice: 490.0, costPrice: 185.0,
    category: 'Attar & Oils', brand: 'Dar Al Joker', stock: 26,
    images: [], featured: true, ratings: 4.9, numReviews: 118,
    taxable: true, taxRate: 15, weight: 0.05,
  },
  {
    name: 'Amber Oil Roll-On 8ml',
    nameAr: 'زيت العنبر رول-أون ٨ مل',
    slug: 'amber-oil-roll-on-8ml',
    code: 'JP-ATR-004',
    description: 'Thick golden amber oil with vanilla and benzoin. Warms on contact with skin and deepens through the day. Travel-friendly roll-on.',
    descriptionAr: 'زيت عنبر ذهبي كثيف مع الفانيليا والبنزوين. يدفأ عند ملامسة البشرة ويتعمق خلال اليوم. رول-أون مناسب للسفر.',
    price: 165.0, comparePrice: 210.0, costPrice: 70.0,
    category: 'Attar & Oils', brand: 'Dar Al Joker', stock: 94,
    images: [], featured: false, ratings: 4.5, numReviews: 203,
    taxable: true, taxRate: 15, weight: 0.05,
  },

  // Musk
  {
    name: 'White Musk Tahara 30ml',
    nameAr: 'مسك أبيض طهارة ٣٠ مل',
    slug: 'white-musk-tahara-30ml',
    code: 'JP-MSK-001',
    description: 'Clean, soft white musk with a powdery cotton finish. Skin-safe and alcohol-free, traditionally worn after ablution.',
    descriptionAr: 'مسك أبيض ناعم ونظيف بلمسة قطنية بودرية. آمن على البشرة وخالٍ من الكحول، يُستخدم تقليدياً بعد الوضوء.',
    price: 120.0, comparePrice: 160.0, costPrice: 48.0,
    category: 'Musk', brand: 'Dar Al Joker', stock: 140,
    images: [], featured: true, ratings: 4.6, numReviews: 287,
    taxable: true, taxRate: 15, weight: 0.09,
  },
  {
    name: 'Musk Al Ghazal Tablets',
    nameAr: 'مسك الغزال أقراص',
    slug: 'musk-al-ghazal-tablets',
    code: 'JP-MSK-002',
    description: 'Pressed musk tablets in a decorative tin — dissolve in water, tuck into wardrobes, or rub directly on skin. Box of 20.',
    descriptionAr: 'أقراص مسك مضغوطة في علبة مزخرفة — تذوب في الماء أو توضع في الخزائن أو تُدهن مباشرة. علبة ٢٠ قرص.',
    price: 85.0, comparePrice: 115.0, costPrice: 34.0,
    category: 'Musk', brand: 'Dar Al Joker', stock: 175,
    images: [], featured: false, ratings: 4.4, numReviews: 246,
    taxable: true, taxRate: 15, weight: 0.08,
  },
  {
    name: 'Black Musk Intense 30ml',
    nameAr: 'مسك أسود انتنس ٣٠ مل',
    slug: 'black-musk-intense-30ml',
    code: 'JP-MSK-003',
    description: 'Dark, smoky musk with oud and leather facets. Far bolder than white musk and built for evening wear.',
    descriptionAr: 'مسك داكن ومدخن بلمسات من العود والجلد. أجرأ بكثير من المسك الأبيض ومصمم للسهرات.',
    price: 155.0, comparePrice: 200.0, costPrice: 64.0,
    category: 'Musk', brand: 'Joker Signature', stock: 68,
    images: [], featured: false, ratings: 4.5, numReviews: 131,
    taxable: true, taxRate: 15, weight: 0.09,
  },

  // Body Mist
  {
    name: 'Joker Noir Body Mist 250ml',
    nameAr: 'جوكر نوار معطر جسم ٢٥٠ مل',
    slug: 'joker-noir-body-mist-250ml',
    code: 'JP-MST-001',
    description: 'The Joker Noir accord in a light, hydrating body mist with aloe and glycerin. Layer it under the EDP to extend wear.',
    descriptionAr: 'تركيبة جوكر نوار في معطر جسم خفيف ومرطب بالألوفيرا والجلسرين. استخدمه تحت العطر لإطالة الثبات.',
    price: 95.0, comparePrice: 130.0, costPrice: 38.0,
    category: 'Body Mist', brand: 'Joker Signature', stock: 130,
    images: [], featured: true, ratings: 4.5, numReviews: 264,
    taxable: true, taxRate: 15, weight: 0.32,
  },
  {
    name: 'Peach & Jasmine Mist 250ml',
    nameAr: 'معطر جسم الخوخ والياسمين ٢٥٠ مل',
    slug: 'peach-jasmine-mist-250ml',
    code: 'JP-MST-002',
    description: 'Juicy white peach and night-blooming jasmine over soft musk. Fresh, fruity and light enough for daily wear.',
    descriptionAr: 'خوخ أبيض عصيري وياسمين ليلي فوق مسك ناعم. منعش وفاكهي وخفيف.',
    price: 79.0, comparePrice: 110.0, costPrice: 31.0,
    category: 'Body Mist', brand: 'Maison Joker', stock: 155,
    images: [], featured: false, ratings: 4.3, numReviews: 198,
    taxable: true, taxRate: 15, weight: 0.32,
  },
  {
    name: 'Vanilla Coconut Mist 250ml',
    nameAr: 'معطر جسم الفانيليا وجوز الهند ٢٥٠ مل',
    slug: 'vanilla-coconut-mist-250ml',
    code: 'JP-MST-003',
    description: 'Creamy vanilla and toasted coconut with a touch of tonka. Smells like a beach holiday and lingers on clothes.',
    descriptionAr: 'فانيليا كريمية وجوز هند محمص مع لمسة تونكا. رائحة عطلة شاطئية تبقى على الملابس.',
    price: 79.0, comparePrice: 110.0, costPrice: 31.0,
    category: 'Body Mist', brand: 'Maison Joker', stock: 148,
    images: [], featured: false, ratings: 4.4, numReviews: 176,
    taxable: true, taxRate: 15, weight: 0.32,
  },

  // Gift Sets
  {
    name: 'Joker Discovery Set — 5 x 10ml',
    nameAr: 'طقم الاكتشاف — ٥ × ١٠ مل',
    slug: 'joker-discovery-set-5x10ml',
    code: 'JP-GFT-001',
    description: 'Five 10ml travel sprays covering the house best-sellers: Joker Noir, Velvet Rose, Amber Sultan, Saffron Oud and Blue Wave. The best way to find your signature.',
    descriptionAr: 'خمس عبوات سفر ١٠ مل تضم أفضل عطور الدار: جوكر نوار، فيلفيت روز، عنبر سلطان، سافرون عود، وبلو ويف. أفضل طريقة لاكتشاف عطرك.',
    price: 320.0, comparePrice: 450.0, costPrice: 145.0,
    category: 'Gift Sets', brand: 'Joker Signature', stock: 60,
    images: [], featured: true, ratings: 4.8, numReviews: 224,
    taxable: true, taxRate: 15, weight: 0.35,
  },
  {
    name: 'Oud Ritual Gift Box',
    nameAr: 'صندوق طقوس العود',
    slug: 'oud-ritual-gift-box',
    code: 'JP-GFT-002',
    description: 'Presentation box with Oud Muattar 40g, an electric burner and a pair of brass tongs. Wrapped and ready to gift for Eid or weddings.',
    descriptionAr: 'صندوق فاخر يضم عود معطر ٤٠ جرام ومبخرة كهربائية وملقط نحاسي. مغلف وجاهز كهدية للعيد والأعراس.',
    price: 445.0, comparePrice: 600.0, costPrice: 215.0,
    category: 'Gift Sets', brand: 'Dar Al Joker', stock: 35,
    images: [], featured: true, ratings: 4.7, numReviews: 87,
    taxable: true, taxRate: 15, weight: 0.75,
  },
  {
    name: 'Rose Lovers Duo Set',
    nameAr: 'طقم عشاق الورد',
    slug: 'rose-lovers-duo-set',
    code: 'JP-GFT-003',
    description: 'Velvet Rose Absolute 75ml paired with Attar Ward Taifi 10ml in a satin-lined case. Spray and oil — the same rose two ways.',
    descriptionAr: 'فيلفيت روز ابسولوت ٧٥ مل مع عطر ورد طائفي ١٠ مل في علبة مبطنة بالساتان. بخاخ وزيت، نفس الوردة بطريقتين.',
    price: 640.0, comparePrice: 825.0, costPrice: 310.0,
    category: 'Gift Sets', brand: 'Maison Joker', stock: 22,
    images: [], featured: false, ratings: 4.9, numReviews: 63,
    taxable: true, taxRate: 15, weight: 0.42,
  },
  {
    name: 'Musk Essentials Trio',
    nameAr: 'ثلاثية المسك الأساسية',
    slug: 'musk-essentials-trio',
    code: 'JP-GFT-004',
    description: 'White Musk Tahara, Black Musk Intense and a tin of Musk Al Ghazal tablets bundled at a set price. A complete musk wardrobe.',
    descriptionAr: 'مسك أبيض طهارة، مسك أسود انتنس، وعلبة أقراص مسك الغزال بسعر الطقم. خزانة مسك متكاملة.',
    price: 295.0, comparePrice: 360.0, costPrice: 128.0,
    category: 'Gift Sets', brand: 'Dar Al Joker', stock: 48,
    images: [], featured: false, ratings: 4.6, numReviews: 109,
    taxable: true, taxRate: 15, weight: 0.28,
  },
];

// Reviews keyed by product slug. `daysAgo` drives createdAt so the home page
// "Real Reactions" strip (rating DESC, then newest) has a meaningful order
// instead of every row sharing a timestamp.
const reviews = [
  {
    slug: 'joker-noir-edp-100ml', name: 'Faisal Al Harbi', rating: 5, daysAgo: 2,
    title: 'Stops people in corridors',
    comment: "Lasts all day in Riyadh's 45°C summer. Got compliments from four strangers in one evening.",
  },
  {
    slug: 'oud-ritual-gift-box', name: 'Noura Al Saud', rating: 5, daysAgo: 5,
    title: 'Gift-ready and genuine',
    comment: 'Ordered as an Eid gift and the wrapping alone was worth it. The oud is the real thing.',
  },
  {
    slug: 'saffron-oud-intense-50ml', name: 'Khalid Al Mutairi', rating: 5, daysAgo: 9,
    title: 'Two sprays is plenty',
    comment: 'I have worn niche fragrances for years. Two sprays of this outlasts a full bottle of anything else.',
  },
  {
    slug: 'attar-ward-taifi-10ml', name: 'Latifa Al Qahtani', rating: 5, daysAgo: 14,
    title: 'Real Taif rose',
    comment: 'You can tell it is genuine Taif rose — honeyed and green, nothing like the synthetic ones.',
  },
  {
    slug: 'royal-oud-cambodi', name: 'Abdulrahman Al Dosari', rating: 5, daysAgo: 21,
    title: 'Worth every riyal',
    comment: 'Properly aged Cambodi. The smoke is sweet rather than sharp and it fills the whole majlis.',
  },
  {
    slug: 'white-musk-tahara-30ml', name: 'Sara Al Otaibi', rating: 4, daysAgo: 4,
    title: 'Clean and soft',
    comment: 'Exactly what I wanted for daily wear. Soft and clean, though I wish it lasted a little longer.',
  },
  {
    slug: 'joker-discovery-set-5x10ml', name: 'Mohammed Al Ghamdi', rating: 5, daysAgo: 11,
    title: 'Best way to start',
    comment: 'Bought this to find my signature. Ended up ordering full bottles of two of them the same week.',
  },
  {
    slug: 'velvet-rose-absolute-75ml', name: 'Hessa Al Zahrani', rating: 4, daysAgo: 17,
    title: 'Rich without being powdery',
    comment: 'Modern take on the classic rose. Rich but never powdery, and the raspberry opening is lovely.',
  },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    await User.create({
      name: 'Admin',
      email: 'admin@jokerperfumes.com',
      password: 'admin123',
      role: 'admin',
    });

    await User.create({
      name: 'Sara Al Otaibi',
      email: 'sara@example.com',
      password: 'password123',
      role: 'customer',
    });

    await Product.bulkCreate(products);

    await Category.bulkCreate(
      categories.map((c, i) => ({ ...c, sortOrder: i + 1, active: true }))
    );

    // Reviews — resolve each slug to the product row created above.
    const bySlug = Object.fromEntries(
      (await Product.findAll({ attributes: ['id', 'slug'] })).map((p) => [p.slug, p.id])
    );
    const now = Date.now();
    await Review.bulkCreate(
      reviews
        .filter((r) => bySlug[r.slug])
        .map(({ slug, daysAgo, ...r }) => ({
          ...r,
          productId: bySlug[slug],
          verified: true,
          approved: true,
          createdAt: new Date(now - daysAgo * 86400000),
          updatedAt: new Date(now - daysAgo * 86400000),
        })),
      // bulkCreate ignores explicit timestamps unless told not to manage them.
      { silent: true }
    );

    // Announcement bar messages (editable later in Admin → Settings).
    await Setting.upsert({
      key: 'announcements',
      value: JSON.stringify([
        'Free Shipping Above SAR 200',
        '100% Authentic · Officially Imported',
      ]),
    });

    console.log(`Database seeded with ${products.length} products, ${categories.length} categories and ${reviews.length} reviews!`);
    console.log('Admin: admin@jokerperfumes.com / admin123');
    console.log('Customer: sara@example.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
