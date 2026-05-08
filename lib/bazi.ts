// ===== BaZi (Four Pillars of Destiny) Calculation Engine =====
// Pure JS algorithm for converting Gregorian dates to Chinese Heavenly Stems and Earthly Branches

// The 10 Heavenly Stems (天干)
const HEAVENLY_STEMS = [
  "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸",
] as const;

// The 12 Earthly Branches (地支)
const EARTHLY_BRANCHES = [
  "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥",
] as const;

// Chinese Zodiac Animals
const ZODIAC_ANIMALS = [
  "Rat 🐀", "Ox 🐂", "Tiger 🐅", "Rabbit 🐇",
  "Dragon 🐉", "Snake 🐍", "Horse 🐴", "Goat 🐏",
  "Monkey 🐵", "Rooster 🐔", "Dog 🐕", "Pig 🐖",
] as const;

// Five Elements mapping
const STEM_ELEMENTS = [
  "Wood", "Wood", "Fire", "Fire", "Earth",
  "Earth", "Metal", "Metal", "Water", "Water",
] as const;

const BRANCH_ELEMENTS = [
  "Water", "Earth", "Wood", "Wood", "Earth",
  "Fire", "Fire", "Earth", "Metal", "Metal", "Earth", "Water",
] as const;

// English names for Stems
const STEM_EN = [
  "Yang Wood", "Yin Wood", "Yang Fire", "Yin Fire", "Yang Earth",
  "Yin Earth", "Yang Metal", "Yin Metal", "Yang Water", "Yin Water",
] as const;

// English names for Branches
const BRANCH_EN = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
] as const;

export interface BaZiPillar {
  stem: string;
  stemEn: string;
  branch: string;
  branchEn: string;
  stemElement: string;
  branchElement: string;
  zodiac: string;
}

export interface BaZiResult {
  year: BaZiPillar;
  month: BaZiPillar;
  day: BaZiPillar;
  hour: BaZiPillar;
  dayMasterElement: string;
  dayMasterYinYang: string;
  elementCounts: {
    Wood: number;
    Fire: number;
    Earth: number;
    Metal: number;
    Water: number;
  };
}

/**
 * Calculate the Four Pillars (BaZi) from a Gregorian date.
 * @param year - Full year (e.g., 1990)
 * @param month - Month (1-12)
 * @param day - Day of month
 * @param hour - Hour (0-23)
 * @returns BaZiResult with all four pillars and element analysis
 */
export function calculateBaZi(
  year: number,
  month: number,
  day: number,
  hour: number
): BaZiResult {
  // Year Pillar
  const yearStemIdx = ((year - 4) % 10 + 10) % 10;
  const yearBranchIdx = ((year - 4) % 12 + 12) % 12;

  // Month Pillar (based on solar terms, simplified approximation)
  // The stem cycle for months depends on the year stem
  const monthBranchBase = (month + 1) % 12; // Approximate: month 1 ≈ Yin (branch 2)
  const monthStemBase = (yearStemIdx % 5) * 2 + ((month + 1) % 10);
  const monthStemIdx = monthStemBase % 10;
  const monthBranchIdx = monthBranchBase;

  // Day Pillar
  // Using a known reference point: Jan 1, 1900 = 庚子 (Stem 6, Branch 0)
  const refDate = new Date(1900, 0, 1); // Jan 1, 1900
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor(
    (targetDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dayStemIdx = ((diffDays + 6) % 10 + 10) % 10;
  const dayBranchIdx = ((diffDays + 0) % 12 + 12) % 12;

  // Hour Pillar (based on the day stem)
  // Hour branches: 23-1=子, 1-3=丑, etc.
  const hourBranchIdx = Math.floor(((hour + 1) % 24) / 2);
  const hourStemIdx = ((dayStemIdx % 5) * 2 + hourBranchIdx) % 10;

  const makePillar = (sIdx: number, bIdx: number): BaZiPillar => ({
    stem: HEAVENLY_STEMS[sIdx],
    stemEn: STEM_EN[sIdx],
    branch: EARTHLY_BRANCHES[bIdx],
    branchEn: BRANCH_EN[bIdx],
    stemElement: STEM_ELEMENTS[sIdx],
    branchElement: BRANCH_ELEMENTS[bIdx],
    zodiac: ZODIAC_ANIMALS[bIdx],
  });

  const yearPillar = makePillar(yearStemIdx, yearBranchIdx);
  const monthPillar = makePillar(monthStemIdx, monthBranchIdx);
  const dayPillar = makePillar(dayStemIdx, dayBranchIdx);
  const hourPillar = makePillar(hourStemIdx, hourBranchIdx);

  // Element counts
  const allElements = [
    yearPillar.stemElement,
    yearPillar.branchElement,
    monthPillar.stemElement,
    monthPillar.branchElement,
    dayPillar.branchElement, // Day master counted separately
    hourPillar.stemElement,
    hourPillar.branchElement,
  ];

  const elementCounts = {
    Wood: allElements.filter((e) => e === "Wood").length,
    Fire: allElements.filter((e) => e === "Fire").length,
    Earth: allElements.filter((e) => e === "Earth").length,
    Metal: allElements.filter((e) => e === "Metal").length,
    Water: allElements.filter((e) => e === "Water").length,
  };

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    dayMasterElement: dayPillar.stemElement,
    dayMasterYinYang: dayStemIdx % 2 === 0 ? "Yang" : "Yin",
    elementCounts,
  };
}
