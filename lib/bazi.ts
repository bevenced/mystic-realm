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
