// ===== 四柱计算 (Four Pillars with Solar Term Correction) =====
// Professional four pillars calculation using solar terms for month pillar.

import { getBaZiMonth, getJieDate } from "./solar-terms";

export const HEAVENLY_STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
export const EARTHLY_BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
export const ZODIAC_ANIMALS = ["Rat 🐀","Ox 🐂","Tiger 🐅","Rabbit 🐇","Dragon 🐉","Snake 🐍","Horse 🐴","Goat 🐏","Monkey 🐵","Rooster 🐔","Dog 🐕","Pig 🐖"];
export const STEM_EN = ["Yang Wood","Yin Wood","Yang Fire","Yin Fire","Yang Earth","Yin Earth","Yang Metal","Yin Metal","Yang Water","Yin Water"];
export const BRANCH_EN = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
export const STEM_ELEMENTS = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];
export const BRANCH_ELEMENTS = ["Water","Earth","Wood","Wood","Earth","Fire","Fire","Earth","Metal","Metal","Earth","Water"];

export interface BaZiPillar {
  stem: string;
  stemEn: string;
  branch: string;
  branchEn: string;
  stemIndex: number;
  branchIndex: number;
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
  dayMasterIndex: number;
  elementCounts: {
    Wood: number;
    Fire: number;
    Earth: number;
    Metal: number;
    Water: number;
  };
  usingSolarTerms: boolean;  // Whether solar terms were used for month pillar
}

/**
 * Get the Heavenly Stem and Earthly Branch (day pillar) for any given date.
 * Reference: Jan 1, 1900 = 庚子 (Stem 6, Branch 0).
 */
export function getDayPillar(date: Date): BaZiPillar {
  const refDate = new Date(1900, 0, 1);
  const diffDays = Math.floor(
    (date.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const stemIdx = ((diffDays + 6) % 10 + 10) % 10;
  const branchIdx = ((diffDays + 0) % 12 + 12) % 12;

  return pillarFromIndices(stemIdx, branchIdx);
}

function pillarFromIndices(stemIdx: number, branchIdx: number): BaZiPillar {
  return {
    stem: HEAVENLY_STEMS[stemIdx],
    stemEn: STEM_EN[stemIdx],
    branch: EARTHLY_BRANCHES[branchIdx],
    branchEn: BRANCH_EN[branchIdx],
    stemIndex: stemIdx,
    branchIndex: branchIdx,
    stemElement: STEM_ELEMENTS[stemIdx],
    branchElement: BRANCH_ELEMENTS[branchIdx],
    zodiac: ZODIAC_ANIMALS[branchIdx],
  };
}

/**
 * Calculate the Four Pillars with solar term corrected month pillar.
 *
 * @param year - Full year
 * @param month - Month (1-12)
 * @param day - Day of month
 * @param hour - Hour (0-23)
 */
export function calculateBaZi(
  year: number,
  month: number,
  day: number,
  hour: number
): BaZiResult {
  const birthDate = new Date(year, month - 1, day, hour);

  // === Year Pillar ===
  // Year changes at 立春 (Li Chun, ~Feb 4), not Jan 1
  const yearStemIdx = ((year - 4) % 10 + 10) % 10;
  const yearBranchIdx = ((year - 4) % 12 + 12) % 12;

  // Check if before 立春 — if so, use previous year's pillar
  const liChunDate = getLiChun(year);
  const isBeforeLiChun = birthDate.getTime() < liChunDate.getTime();

  const actualYearStemIdx = isBeforeLiChun
    ? ((year - 5) % 10 + 10) % 10
    : yearStemIdx;
  const actualYearBranchIdx = isBeforeLiChun
    ? ((year - 5) % 12 + 12) % 12
    : yearBranchIdx;

  const yearPillar = pillarFromIndices(actualYearStemIdx, actualYearBranchIdx);

  // === Month Pillar (solar term corrected) ===
  const baziMonth = getBaZiMonth(birthDate);
  const usingSolarTerms = baziMonth > 0;

  // Month branch: month 1 = 寅 (branch 2), month 2 = 卯 (branch 3), etc.
  const monthBranchIdx = (baziMonth + 1) % 12;

  // Month stem: derived from year stem
  // 甲己年 → 丙寅月, 乙庚年 → 戊寅, 丙辛 → 庚寅, 丁壬 → 壬寅, 戊癸 → 甲寅
  const monthStemBase = (actualYearStemIdx % 5) * 2;
  const monthStemIdx = (monthStemBase + monthBranchIdx) % 10;

  const monthPillar = pillarFromIndices(monthStemIdx, monthBranchIdx);

  // === Day Pillar ===
  const refDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor(
    (targetDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dayStemIdx = ((diffDays + 6) % 10 + 10) % 10;
  const dayBranchIdx = ((diffDays + 0) % 12 + 12) % 12;

  const dayPillar = pillarFromIndices(dayStemIdx, dayBranchIdx);

  // === Hour Pillar ===
  // Hour branches: 23-1=子(0), 1-3=丑(1), 3-5=寅(2), etc.
  const hourBranchIdx = Math.floor(((hour + 1) % 24) / 2);
  // Hour stem derived from day stem
  const hourStemIdx = ((dayStemIdx % 5) * 2 + hourBranchIdx) % 10;

  const hourPillar = pillarFromIndices(hourStemIdx, hourBranchIdx);

  // === Element Counts ===
  const allElements = [
    yearPillar.stemElement,
    yearPillar.branchElement,
    monthPillar.stemElement,
    monthPillar.branchElement,
    dayPillar.branchElement,
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
    dayMasterIndex: dayStemIdx,
    elementCounts,
    usingSolarTerms,
  };
}

/**
 * Get the date of 立春 (Li Chun / Start of Spring) for a given year.
 * This is the astronomical beginning of the BaZi year.
 */
function getLiChun(year: number): Date {
  const jieDate = getJieDate(year, 1);
  if (jieDate) return jieDate;

  // Fallback: approximate formula for years outside our solar term table
  const approx = new Date(year, 1, 3);
  const offset = ((year - 2000) * 0.2422) % 1;
  approx.setDate(3 + (offset > 0.5 ? 1 : 0));
  return approx;
}

// Re-export helper for backward compatibility
export { getBaZiMonth } from "./solar-terms";
