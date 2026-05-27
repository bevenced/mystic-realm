// ===== BaZi (Four Pillars of Destiny) Calculation Engine =====
// Re-exports from lib/bazi-engine for backward compatibility.
// All new code should import from lib/bazi-engine directly.

// Core types
export type { BaZiPillar, BaZiResult } from "./bazi-engine/pillars";
export type { TenGodResult } from "./bazi-engine/ten-gods";
export type { NaYinResult } from "./bazi-engine/nayin";
export type { HiddenStem } from "./bazi-engine/hidden-stems";
export type { ShenShaResult } from "./bazi-engine/shensha";
export type { ElementStrengthResult } from "./bazi-engine/elements";
export type { PatternResult } from "./bazi-engine/pattern";
export type { TiaoHouResult } from "./bazi-engine/tiaohou";
export type { DayPillarGradeResult } from "./bazi-engine/day-pillar-grade";
export type { DayPillarProfile } from "./bazi-engine/day-pillar-profile";
export type { PillarRelation } from "./bazi-engine/pillar-relations";
export type { DaYunResult, DaYunCycle } from "./bazi-engine/luck";
export type { AnnualFortune, MonthlyFortune } from "./bazi-engine/annual";
export type { JieQi } from "./bazi-engine/solar-terms";

// Pillars & Calculation
export { calculateBaZi, getDayPillar, getBaZiMonth } from "./bazi-engine/pillars";
export { getAllTenGods, getTenGod } from "./bazi-engine/ten-gods";
export { getNaYin, getSexagenaryIndex } from "./bazi-engine/nayin";
export { getAllHiddenStems, getHiddenStems } from "./bazi-engine/hidden-stems";
export { calculateShenSha, getShenshaCategory, getKongWang, getAllKongWang } from "./bazi-engine/shensha";
export { calculateElementStrength } from "./bazi-engine/elements";
export { calculatePattern } from "./bazi-engine/pattern";
export { getTiaoHou } from "./bazi-engine/tiaohou";
export { getDayPillarGrade } from "./bazi-engine/day-pillar-grade";
export { getDayPillarProfile } from "./bazi-engine/day-pillar-profile";
export { calculatePillarRelations } from "./bazi-engine/pillar-relations";
export { getFortuneStage, getAllFortuneStages, FORTUNE_STAGE_INFO } from "./bazi-engine/twelve-fortune";
export { calculateDaYun, getDaYunDirection, getCurrentDaYun } from "./bazi-engine/luck";
export { calculateAnnualFortune, calculateAnnualFortunes, getCurrentYearFortune, getYearPillar } from "./bazi-engine/annual";
export { getPreviousJie, getNextJie, JIE_NAMES } from "./bazi-engine/solar-terms";

// Constants
export {
  HEAVENLY_STEMS, EARTHLY_BRANCHES, ZODIAC_ANIMALS,
  STEM_EN, BRANCH_EN, STEM_ELEMENTS, BRANCH_ELEMENTS,
} from "./bazi-engine/pillars";
