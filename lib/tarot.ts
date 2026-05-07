// ===== Tarot Card Definitions =====
// 78 cards: 22 Major Arcana + 56 Minor Arcana (16 Court + 40 Numbered)

export interface TarotCard {
  id: number;        // 0-77
  name: string;      // e.g. "The Fool"
  arcana: "major" | "minor";
  suit?: "wands" | "cups" | "swords" | "pentacles";
  number?: number;   // 0-21 for major, 1-14 (Ace=1, Page=11, Knight=12, Queen=13, King=14) for minor
  upright: string;   // Brief upright meaning
  reversed: string;  // Brief reversed meaning
  keywords: string[]; // 3-5 keywords
  emoji: string;     // Visual representation
  element?: string;  // Fire, Water, Air, Earth, Spirit
}

export interface SpreadConfig {
  key: string;
  name: string;
  nameZh: string;
  cardCount: number;
  positions: string[];
  price: number;
  description: string;
}

// ===== 22 Major Arcana =====
const majorArcana: TarotCard[] = [
  { id: 0, name: "The Fool", arcana: "major", number: 0, upright: "New beginnings, innocence, spontaneity, free spirit", reversed: "Recklessness, risk-taking, holding back", keywords: ["beginnings", "adventure", "innocence"], emoji: "🃏", element: "Spirit" },
  { id: 1, name: "The Magician", arcana: "major", number: 1, upright: "Manifestation, resourcefulness, power, inspired action", reversed: "Manipulation, poor planning, untapped talents", keywords: ["manifestation", "power", "skill"], emoji: "🎩", element: "Spirit" },
  { id: 2, name: "The High Priestess", arcana: "major", number: 2, upright: "Intuition, sacred knowledge, divine feminine, subconscious", reversed: "Secrets, disconnected from intuition, withdrawal", keywords: ["intuition", "mystery", "inner wisdom"], emoji: "🌙", element: "Spirit" },
  { id: 3, name: "The Empress", arcana: "major", number: 3, upright: "Femininity, beauty, nature, nurturing, abundance", reversed: "Creative block, dependence, emptiness", keywords: ["abundance", "nurture", "creativity"], emoji: "👑", element: "Spirit" },
  { id: 4, name: "The Emperor", arcana: "major", number: 4, upright: "Authority, structure, control, fatherhood, stability", reversed: "Tyranny, rigidity, coldness, domination", keywords: ["authority", "structure", "control"], emoji: "🏛️", element: "Spirit" },
  { id: 5, name: "The Hierophant", arcana: "major", number: 5, upright: "Spiritual wisdom, tradition, conformity, morality", reversed: "Personal beliefs, freedom, challenging status quo", keywords: ["tradition", "wisdom", "conformity"], emoji: "📿", element: "Spirit" },
  { id: 6, name: "The Lovers", arcana: "major", number: 6, upright: "Love, harmony, relationships, values alignment, choices", reversed: "Self-love, disharmony, imbalance, misalignment", keywords: ["love", "harmony", "choices"], emoji: "💕", element: "Spirit" },
  { id: 7, name: "The Chariot", arcana: "major", number: 7, upright: "Control, willpower, success, determination, action", reversed: "Self-discipline, opposition, lack of direction", keywords: ["willpower", "determination", "victory"], emoji: "⚡", element: "Spirit" },
  { id: 8, name: "Strength", arcana: "major", number: 8, upright: "Inner strength, bravery, compassion, focus, self-control", reversed: "Self-doubt, weakness, insecurity, raw emotion", keywords: ["courage", "patience", "compassion"], emoji: "🦁", element: "Spirit" },
  { id: 9, name: "The Hermit", arcana: "major", number: 9, upright: "Soul-searching, introspection, solitude, inner guidance", reversed: "Isolation, loneliness, withdrawal, anti-social", keywords: ["solitude", "guidance", "reflection"], emoji: "🏔️", element: "Spirit" },
  { id: 10, name: "Wheel of Fortune", arcana: "major", number: 10, upright: "Good luck, karma, life cycles, destiny, turning point", reversed: "Bad luck, resistance to change, breaking cycles", keywords: ["cycles", "destiny", "change"], emoji: "🎡", element: "Spirit" },
  { id: 11, name: "Justice", arcana: "major", number: 11, upright: "Justice, fairness, truth, cause and effect, law", reversed: "Unfairness, lack of accountability, dishonesty", keywords: ["truth", "fairness", "karma"], emoji: "⚖️", element: "Spirit" },
  { id: 12, name: "The Hanged Man", arcana: "major", number: 12, upright: "Surrender, letting go, new perspectives, pause", reversed: "Delays, resistance, stalling, indecision, futility", keywords: ["surrender", "sacrifice", "new perspective"], emoji: "🔄", element: "Spirit" },
  { id: 13, name: "Death", arcana: "major", number: 13, upright: "Endings, change, transformation, transition, rebirth", reversed: "Resistance to change, inability to move on, stagnation", keywords: ["transformation", "endings", "rebirth"], emoji: "🦋", element: "Spirit" },
  { id: 14, name: "Temperance", arcana: "major", number: 14, upright: "Balance, moderation, patience, purpose, meaning", reversed: "Imbalance, excess, self-healing, realignment", keywords: ["balance", "moderation", "patience"], emoji: "🌈", element: "Spirit" },
  { id: 15, name: "The Devil", arcana: "major", number: 15, upright: "Shadow self, attachment, addiction, restriction, sexuality", reversed: "Releasing limiting beliefs, exploring dark thoughts, detachment", keywords: ["bondage", "shadow", "materialism"], emoji: "⛓️", element: "Spirit" },
  { id: 16, name: "The Tower", arcana: "major", number: 16, upright: "Sudden change, upheaval, chaos, revelation, awakening", reversed: "Personal transformation, fear of change, averting disaster", keywords: ["upheaval", "revelation", "awakening"], emoji: "🌩️", element: "Spirit" },
  { id: 17, name: "The Star", arcana: "major", number: 17, upright: "Hope, faith, purpose, renewal, spirituality, inspiration", reversed: "Lack of faith, despair, self-trust, disconnection", keywords: ["hope", "inspiration", "renewal"], emoji: "⭐", element: "Spirit" },
  { id: 18, name: "The Moon", arcana: "major", number: 18, upright: "Illusion, fear, anxiety, subconscious, intuition", reversed: "Release of fear, repressed emotion, inner confusion", keywords: ["illusion", "intuition", "fear"], emoji: "🌕", element: "Spirit" },
  { id: 19, name: "The Sun", arcana: "major", number: 19, upright: "Positivity, fun, warmth, success, vitality, joy", reversed: "Inner child, feeling down, overly optimistic", keywords: ["joy", "success", "vitality"], emoji: "☀️", element: "Spirit" },
  { id: 20, name: "Judgement", arcana: "major", number: 20, upright: "Judgement, rebirth, inner calling, absolution", reversed: "Self-doubt, inner critic, ignoring the call", keywords: ["judgement", "rebirth", "calling"], emoji: "📯", element: "Spirit" },
  { id: 21, name: "The World", arcana: "major", number: 21, upright: "Completion, integration, accomplishment, travel", reversed: "Seeking personal closure, shortcuts, delays", keywords: ["completion", "fulfillment", "wholeness"], emoji: "🌍", element: "Spirit" },
];

// ===== Suit data for Minor Arcana =====
const suitData = {
  wands: { element: "Fire", theme: "action, passion, energy, creativity", emoji: "🔥" },
  cups: { element: "Water", theme: "emotions, relationships, intuition, healing", emoji: "💧" },
  swords: { element: "Air", theme: "intellect, conflict, truth, mental clarity", emoji: "💨" },
  pentacles: { element: "Earth", theme: "material, work, finances, physical world", emoji: "🪙" },
} as const;

const courtNames = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
const courtMap: Record<string, number> = { Ace: 1, Two: 2, Three: 3, Four: 4, Five: 5, Six: 6, Seven: 7, Eight: 8, Nine: 9, Ten: 10, Page: 11, Knight: 12, Queen: 13, King: 14 };

// Minor arcana keyword templates per position
const minorKeywords: Record<string, string[]> = {
  "Ace-wands": ["inspiration", "new passion", "creative spark"],
  "Ace-cups": ["new love", "emotional openness", "intuition"],
  "Ace-swords": ["breakthrough", "clarity", "mental power"],
  "Ace-pentacles": ["new opportunity", "prosperity", "manifestation"],
};

function generateMinorMeaning(name: string, suit: keyof typeof suitData, num: number): { upright: string; reversed: string; keywords: string[] } {
  const theme = suitData[suit].theme;
  const templates: Record<string, { u: string; r: string }> = {
    "1": { u: `New ${theme} energy, fresh start, potential`, r: `Blocked ${theme}, missed opportunity, delayed start` },
    "2": { u: `Balancing ${theme}, partnership, duality`, r: `Imbalance, misalignment, overcompromise` },
    "3": { u: `Growth in ${theme}, collaboration, celebration`, r: `Lack of growth, delays, obstacles` },
    "4": { u: `Stability in ${theme}, rest, consolidation`, r: `Instability, restlessness, reevaluation` },
    "5": { u: `Conflict or challenge in ${theme}, growth through struggle`, r: `Recovery from conflict, reconciliation, acceptance` },
    "6": { u: `Harmony in ${theme}, transitions, giving and receiving`, r: `Stagnation, imbalance, unfair exchange` },
    "7": { u: `Reflection on ${theme}, assessment, perseverance`, r: `Confusion, illusion, lack of focus` },
    "8": { u: `Mastery of ${theme}, momentum, progress`, r: `Stalled progress, feeling stuck, temporary setback` },
    "9": { u: `Near completion in ${theme}, fulfillment, abundance`, r: `Overextension, burnout, almost there` },
    "10": { u: `Completion of ${theme} cycle, culmination, inheritance`, r: `Heavy burden, delayed endings, excess baggage` },
    "11": { u: `Curiosity, learning, new message about ${theme}`, r: `Immaturity, lack of direction, missed message` },
    "12": { u: `Action on ${theme}, adventure, swift movement`, r: `Haste, recklessness, scattered energy` },
    "13": { u: `Mastery of ${theme}, nurturing, emotional maturity`, r: `Emotional excess, dependence, inner imbalance` },
    "14": { u: `Authority over ${theme}, abundance, leadership`, r: `Tyranny, rigidity, poor management` },
  };
  const t = templates[String(num)] || { u: `${theme} energy`, r: `Blocked ${theme}` };
  const keyStr = `${num === 1 ? "Ace" : num === 11 ? "Page" : num === 12 ? "Knight" : num === 13 ? "Queen" : num === 14 ? "King" : num}-${suit}`;
  const keywords = minorKeywords[keyStr] || [theme.split(",")[0].trim(), "growth", "reflection"];
  return { upright: t.u, reversed: t.r, keywords };
}

// Generate 56 Minor Arcana
const minorArcana: TarotCard[] = [];
let cardId = 22;
for (const suit of ["wands", "cups", "swords", "pentacles"] as const) {
  for (let num = 1; num <= 14; num++) {
    const name = `${courtNames[num - 1]} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`;
    const meaning = generateMinorMeaning(name, suit, num);
    minorArcana.push({
      id: cardId++,
      name,
      arcana: "minor",
      suit,
      number: num,
      ...meaning,
      emoji: num <= 10 ? suitData[suit].emoji : ["🛡️", "🐴", "👸", "🤴"][num - 11],
      element: suitData[suit].element,
    });
  }
}

// ===== All 78 Cards =====
export const allCards: TarotCard[] = [...majorArcana, ...minorArcana];

// ===== Spread Configurations =====
export const spreads: SpreadConfig[] = [
  {
    key: "three-card",
    name: "Three Card",
    nameZh: "三牌阵",
    cardCount: 3,
    positions: ["Past", "Present", "Future"],
    price: 4.99,
    description: "A quick glimpse into your past, present, and future.",
  },
  {
    key: "five-card",
    name: "Week Ahead",
    nameZh: "一周展望",
    cardCount: 5,
    positions: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    price: 7.99,
    description: "Explore the energies shaping your week ahead.",
  },
  {
    key: "celtic-cross",
    name: "Celtic Cross",
    nameZh: "凯尔特十字",
    cardCount: 10,
    positions: [
      "Present Situation",
      "Challenge",
      "Foundation (Past)",
      "Recent Past",
      "Best Outcome",
      "Near Future",
      "Your Approach",
      "External Influences",
      "Hopes & Fears",
      "Final Outcome",
    ],
    price: 12.99,
    description: "The most comprehensive reading, exploring every angle of your question.",
  },
];

export function getSpread(key: string): SpreadConfig {
  return spreads.find((s) => s.key === key) ?? spreads[0];
}

// ===== Card Drawing =====
export function drawCards(count: number): { card: TarotCard; isReversed: boolean }[] {
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((card) => ({
    card,
    isReversed: Math.random() > 0.5,
  }));
}
