// ===== Product Data =====
// Static product catalog organized by theme

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  theme: string;
  themeLabel: string;
  emoji: string;
  category: string;
  badge?: string;
}

export const products: Product[] = [
  // ===== MEDITATION =====
  {
    id: "med-001",
    name: "Singing Bowl Set",
    description: "Hand-hammered Tibetan singing bowl with cushion and mallet. Perfect for meditation and sound healing.",
    price: 49.99,
    originalPrice: 69.99,
    theme: "meditation",
    themeLabel: "Meditation",
    emoji: "🔔",
    category: "Sound Healing",
    badge: "Best Seller",
  },
  {
    id: "med-002",
    name: "Meditation Cushion (Zafu)",
    description: "Organic cotton buckwheat hull meditation cushion. Ergonomic design for extended sitting sessions.",
    price: 39.99,
    theme: "meditation",
    themeLabel: "Meditation",
    emoji: "🧘",
    category: "Accessories",
  },
  {
    id: "med-003",
    name: "Guided Meditation Journal",
    description: "A beautifully designed journal with daily meditation prompts, gratitude pages, and intention setting.",
    price: 24.99,
    theme: "meditation",
    themeLabel: "Meditation",
    emoji: "📓",
    category: "Books",
  },
  {
    id: "med-004",
    name: "Premium Incense Collection",
    description: "Hand-rolled incense sticks in sandalwood, lavender, and frankincense. 120 sticks total.",
    price: 18.99,
    theme: "meditation",
    themeLabel: "Meditation",
    emoji: "🪔",
    category: "Aromatherapy",
  },
  // ===== HEALING =====
  {
    id: "heal-001",
    name: "Chakra Crystal Set",
    description: "Seven natural gemstones representing each chakra, with velvet pouch and guide booklet.",
    price: 34.99,
    originalPrice: 44.99,
    theme: "healing",
    themeLabel: "Healing",
    emoji: "💎",
    category: "Crystals",
    badge: "Popular",
  },
  {
    id: "heal-002",
    name: "Palo Santo Sticks (6 Pack)",
    description: "Ethically sourced holy wood from Peru. Natural purifier for energy clearing and healing rituals.",
    price: 14.99,
    theme: "healing",
    themeLabel: "Healing",
    emoji: "🪵",
    category: "Energy Clearing",
  },
  {
    id: "heal-003",
    name: "Reiki Charged Candle Set",
    description: "Set of 3 hand-poured soy candles infused with Reiki energy. Scents: Peace, Love, Clarity.",
    price: 29.99,
    theme: "healing",
    themeLabel: "Healing",
    emoji: "🕯️",
    category: "Aromatherapy",
  },
  {
    id: "heal-004",
    name: "Selenite Wand",
    description: "Natural selenite crystal wand for energy cleansing and charging other crystals. 6-8 inches.",
    price: 22.99,
    theme: "healing",
    themeLabel: "Healing",
    emoji: "✨",
    category: "Crystals",
  },
  // ===== FENG SHUI =====
  {
    id: "fs-001",
    name: "Lucky Bamboo Arrangement",
    description: "Elegant arrangement of 8 lucky bamboo stalks in a ceramic vase. Symbolizes prosperity and growth.",
    price: 28.99,
    theme: "fengshui",
    themeLabel: "Feng Shui",
    emoji: "🎋",
    category: "Plants",
    badge: "Top Pick",
  },
  {
    id: "fs-002",
    name: "Feng Shui Compass (Luo Pan)",
    description: "Traditional Chinese Feng Shui compass for determining directions and analyzing space energy.",
    price: 59.99,
    originalPrice: 79.99,
    theme: "fengshui",
    themeLabel: "Feng Shui",
    emoji: "🧭",
    category: "Tools",
  },
  {
    id: "fs-003",
    name: "Laughing Buddha Figurine",
    description: "Hand-painted resin Laughing Buddha in golden robes. 6 inches tall. Brings joy and abundance.",
    price: 19.99,
    theme: "fengshui",
    themeLabel: "Feng Shui",
    emoji: "😊",
    category: "Decor",
  },
  {
    id: "fs-004",
    name: "Crystal Money Tree",
    description: "Gemstone money tree on amethyst base. Symbolizes wealth, prosperity, and steady growth.",
    price: 32.99,
    theme: "fengshui",
    themeLabel: "Feng Shui",
    emoji: "🌳",
    category: "Crystals",
  },
  // ===== BAZI =====
  {
    id: "bz-001",
    name: "Chinese Zodiac Jade Pendant",
    description: "Genuine jade pendant with your Chinese zodiac animal. Comes with red silk cord and gift box.",
    price: 45.99,
    theme: "bazi",
    themeLabel: "BaZi Divination",
    emoji: "🐉",
    category: "Jewelry",
    badge: "Exclusive",
  },
  {
    id: "bz-002",
    name: "I Ching Coin Set",
    description: "Authentic replica of ancient Chinese coins for divination. Set of 3 with silk pouch and instruction guide.",
    price: 16.99,
    theme: "bazi",
    themeLabel: "BaZi Divination",
    emoji: "🪙",
    category: "Tools",
  },
  {
    id: "bz-003",
    name: "Five Elements Balance Bracelet",
    description: "Handcrafted bracelet with natural gemstones representing all five Wu Xing elements.",
    price: 27.99,
    theme: "bazi",
    themeLabel: "BaZi Divination",
    emoji: "📿",
    category: "Jewelry",
  },
  {
    id: "bz-004",
    name: "BaZi Destiny Reading Book",
    description: "Comprehensive guide to understanding your Four Pillars of Destiny. Includes calculation charts and interpretation tables.",
    price: 21.99,
    theme: "bazi",
    themeLabel: "BaZi Divination",
    emoji: "📖",
    category: "Books",
  },
  // ===== TAROT =====
  {
    id: "tar-001",
    name: "Rider-Waite Tarot Deck",
    description: "The classic Rider-Waite-Smith tarot deck. 78 cards with instruction booklet. The essential deck for every reader.",
    price: 22.99,
    theme: "tarot",
    themeLabel: "Tarot",
    emoji: "🃏",
    category: "Card Decks",
    badge: "Essential",
  },
  {
    id: "tar-002",
    name: "Velvet Tarot Pouch",
    description: "Handmade velvet pouch with celestial moon and stars embroidery. Fits standard tarot decks.",
    price: 14.99,
    theme: "tarot",
    themeLabel: "Tarot",
    emoji: "🌙",
    category: "Accessories",
  },
  {
    id: "tar-003",
    name: "Tarot Reading Cloth",
    description: "Premium silk reading cloth with sacred geometry pattern. 24x24 inches. Protects and energizes your cards.",
    price: 19.99,
    theme: "tarot",
    themeLabel: "Tarot",
    emoji: "✦",
    category: "Accessories",
  },
  {
    id: "tar-004",
    name: "Oracle Card Deck",
    description: "Beautifully illustrated 44-card oracle deck for daily guidance and intuitive readings.",
    price: 26.99,
    theme: "tarot",
    themeLabel: "Tarot",
    emoji: "🔮",
    category: "Card Decks",
  },
  // ===== ASTROLOGY =====
  {
    id: "ast-001",
    name: "Birth Chart Art Print",
    description: "Custom-framable art print of your natal chart. Personalized with your birth data and planetary positions.",
    price: 34.99,
    originalPrice: 49.99,
    theme: "astrology",
    themeLabel: "Astrology",
    emoji: "🌌",
    category: "Art",
    badge: "Personalized",
  },
  {
    id: "ast-002",
    name: "Zodiac Constellation Mug",
    description: "Ceramic mug featuring your zodiac constellation with gold foil details. 12 oz capacity.",
    price: 16.99,
    theme: "astrology",
    themeLabel: "Astrology",
    emoji: "☕",
    category: "Lifestyle",
  },
  {
    id: "ast-003",
    name: "Moon Phase Wall Calendar",
    description: "Beautiful illustrated moon phase calendar for 2026. Track lunar cycles and plan rituals.",
    price: 19.99,
    theme: "astrology",
    themeLabel: "Astrology",
    emoji: "🌕",
    category: "Art",
  },
  {
    id: "ast-004",
    name: "Astrology Starter Kit",
    description: "Complete beginner's kit: birth chart calculator guide, zodiac reference cards, and interpretation workbook.",
    price: 38.99,
    theme: "astrology",
    themeLabel: "Astrology",
    emoji: "⭐",
    category: "Kits",
  },
];

/** Get products filtered by theme */
export function getProductsByTheme(theme: string): Product[] {
  if (!theme || theme === "all") return products;
  return products.filter((p) => p.theme === theme);
}

/** Get a single product by ID */
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/** Get all unique categories */
export function getProductCategories(): string[] {
  const seen = new Set<string>();
  for (const p of products) {
    seen.add(p.category);
  }
  return Array.from(seen).sort();
}
