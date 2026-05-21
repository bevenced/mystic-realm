// ===== BaZi Engine — Unified Export =====
// Professional BaZi (Four Pillars of Destiny) calculation engine

export { calculateBaZi, getDayPillar, getBaZiMonth } from "./pillars";
export type { BaZiPillar, BaZiResult } from "./pillars";

export { getHiddenStems, getHiddenStemElementWeights, getAllHiddenStems } from "./hidden-stems";
export type { HiddenStem } from "./hidden-stems";

export { getTenGod, getAllTenGods } from "./ten-gods";
export type { TenGodResult } from "./ten-gods";

export { getNaYin, getSexagenaryIndex } from "./nayin";
export type { NaYinResult } from "./nayin";

export { calculateShenSha } from "./shensha";
export type { ShenShaResult } from "./shensha";

export { calculateElementStrength } from "./elements";
export type { ElementStrengthResult } from "./elements";

export { calculateDaYun, getDaYunDirection, getCurrentDaYun } from "./luck";
export type { DaYunResult, DaYunCycle } from "./luck";

export { calculateAnnualFortune, calculateAnnualFortunes, getCurrentYearFortune, getYearPillar } from "./annual";
export type { AnnualFortune, MonthlyFortune } from "./annual";

export { getPreviousJie, getNextJie, JIE_NAMES } from "./solar-terms";
export type { JieQi } from "./solar-terms";

// Shared constants
export const HEAVENLY_STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
export const EARTHLY_BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
export const STEM_EN = ["Yang Wood","Yin Wood","Yang Fire","Yin Fire","Yang Earth","Yin Earth","Yang Metal","Yin Metal","Yang Water","Yin Water"];
export const BRANCH_EN = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
export const STEM_ELEMENTS = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];
export const BRANCH_ELEMENTS = ["Water","Earth","Wood","Wood","Earth","Fire","Fire","Earth","Metal","Metal","Earth","Water"];
export const ZODIAC_ANIMALS = ["Rat 🐀","Ox 🐂","Tiger 🐅","Rabbit 🐇","Dragon 🐉","Snake 🐍","Horse 🐴","Goat 🐏","Monkey 🐵","Rooster 🐔","Dog 🐕","Pig 🐖"];
