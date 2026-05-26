// ===== BaZi (Four Pillars of Destiny) Calculation Engine =====
// Professional-grade engine with solar term correction, Da Yun, Ten Gods, etc.
// Full documentation: lib/bazi-engine/index.ts
//
// This file re-exports the new engine for backward compatibility.
// All new code should import from lib/bazi-engine directly.

export {
  calculateBaZi,
  getDayPillar,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ZODIAC_ANIMALS,
  STEM_EN,
  BRANCH_EN,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
} from "./bazi-engine/pillars";

export type { BaZiPillar, BaZiResult } from "./bazi-engine/pillars";

export { getAllTenGods, getTenGod } from "./bazi-engine/ten-gods";
export type { TenGodResult } from "./bazi-engine/ten-gods";

export { getNaYin } from "./bazi-engine/nayin";
export type { NaYinResult } from "./bazi-engine/nayin";

export { getAllHiddenStems, getHiddenStems } from "./bazi-engine/hidden-stems";
export type { HiddenStem } from "./bazi-engine/hidden-stems";

export { getAllFortuneStages } from "./bazi-engine/twelve-fortune";
