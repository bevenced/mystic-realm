// ===== 流年/流月 (Annual & Monthly Fortune) =====
// 流年 (Liu Nian): Yearly fortune based on the interaction between
// the current year's pillar and the natal chart.
// 流月 (Liu Yue): Monthly fortune similar to annual but for months.

const HEAVENLY_STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const EARTHLY_BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const STEM_EN = ["Yang Wood","Yin Wood","Yang Fire","Yin Fire","Yang Earth","Yin Earth","Yang Metal","Yin Metal","Yang Water","Yin Water"];
const BRANCH_EN = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
const STEM_ELEMENTS = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];
const BRANCH_ELEMENTS = ["Water","Earth","Wood","Wood","Earth","Fire","Fire","Earth","Metal","Metal","Earth","Water"];

export interface AnnualFortune {
  year: number;                  // Gregorian year
  stemIndex: number;
  branchIndex: number;
  stem: string;
  branch: string;
  stemEn: string;
  branchEn: string;
  stemElement: string;
  branchElement: string;
  // Interaction with natal chart
  interactionWithDayMaster: "supportive" | "neutral" | "challenging" | "draining";
  favorableElements: string[];   // Elements favored this year
  challengingElements: string[]; // Elements challenged this year
  lifeAspects: {
    career: "excellent" | "good" | "neutral" | "challenging" | "difficult";
    wealth: "excellent" | "good" | "neutral" | "challenging" | "difficult";
    relationships: "excellent" | "good" | "neutral" | "challenging" | "difficult";
    health: "excellent" | "good" | "neutral" | "challenging" | "difficult";
  };
  description: string;           // Brief fortune description
}

export interface MonthlyFortune {
  month: number;                 // 1-12
  stemIndex: number;
  branchIndex: number;
  stem: string;
  branch: string;
  description: string;
}

// 12 Chinese zodiac animals + element for the year
const ZODIAC_ELEMENTS: Record<number, string> = {
  0: "Water", 1: "Earth", 2: "Wood", 3: "Wood", 4: "Earth",
  5: "Fire", 6: "Fire", 7: "Earth", 8: "Metal", 9: "Metal",
  10: "Earth", 11: "Water",
};

// Six Conflicts (六冲) — branches that oppose each other
const SIX_CONFLICTS: Record<number, number> = {
  0: 6, 6: 0,   // 子午
  1: 7, 7: 1,   // 丑未
  2: 8, 8: 2,   // 寅申
  3: 9, 9: 3,   // 卯酉
  4: 10, 10: 4, // 辰戌
  5: 11, 11: 5, // 巳亥
};

// Six Harmonies (六合) — branches that complement each other
const SIX_HARMONIES: Record<number, number> = {
  0: 1, 1: 0,   // 子丑
  2: 11, 11: 2, // 寅亥
  3: 10, 10: 3, // 卯戌
  4: 9, 9: 4,   // 辰酉
  5: 8, 8: 5,   // 巳申
  6: 7, 7: 6,   // 午未
};

/**
 * Get the year pillar for any Gregorian year.
 */
export function getYearPillar(year: number): { stemIndex: number; branchIndex: number } {
  return {
    stemIndex: ((year - 4) % 10 + 10) % 10,
    branchIndex: ((year - 4) % 12 + 12) % 12,
  };
}

/**
 * Calculate annual fortune (流年) for a specific year based on natal chart.
 */
export function calculateAnnualFortune(
  year: number,
  dayMasterIndex: number,
  birthYearStem: number,
  birthYearBranch: number
): AnnualFortune {
  const yearPillar = getYearPillar(year);
  const { stemIndex: yearStem, branchIndex: yearBranch } = yearPillar;
  const dmElement = STEM_ELEMENTS[dayMasterIndex];
  const yearElement = STEM_ELEMENTS[yearStem];

  // === Element interaction ===
  // Five element cycle
  const cycle = ["Wood", "Fire", "Earth", "Metal", "Water"];
  const dmIdx = cycle.indexOf(dmElement);
  const yrIdx = cycle.indexOf(yearElement);

  let interactionWithDayMaster: "supportive" | "neutral" | "challenging" | "draining";
  if (yrIdx === (dmIdx + 3) % 5) {
    // Year element produces DM (e.g., Water→Wood)
    interactionWithDayMaster = "supportive";
  } else if (yrIdx === (dmIdx + 4) % 5) {
    // Year element controls DM (e.g., Metal→Wood)
    interactionWithDayMaster = "challenging";
  } else if (yrIdx === (dmIdx + 1) % 5) {
    // DM produces year element (draining)
    interactionWithDayMaster = "draining";
  } else if (yrIdx === dmIdx) {
    interactionWithDayMaster = "supportive"; // Same element
  } else {
    // DM controls year element
    interactionWithDayMaster = "neutral";
  }

  // === Branch conflicts and harmonies ===
  const hasConflict = SIX_CONFLICTS[yearBranch] === birthYearBranch;
  const hasHarmony = SIX_HARMONIES[yearBranch] === birthYearBranch ||
    SIX_HARMONIES[yearBranch] === birthYearBranch;

  // === Determine favorable/challenging elements for this year ===
  const favorableElements: string[] = [];
  const challengingElements: string[] = [];
  if (interactionWithDayMaster === "supportive") {
    favorableElements.push(yearElement, dmElement);
    challengingElements.push(cycle[(dmIdx + 4) % 5]); // Controlling element
  } else if (interactionWithDayMaster === "challenging") {
    challengingElements.push(yearElement);
    favorableElements.push(cycle[(dmIdx + 3) % 5]); // Nourishing element
  } else if (interactionWithDayMaster === "draining") {
    challengingElements.push(yearElement);
    favorableElements.push(cycle[(dmIdx + 3) % 5]);
  } else {
    favorableElements.push(dmElement);
    challengingElements.push(cycle[(dmIdx + 4) % 5]);
  }

  // === Life aspect ratings ===
  const conflictBonus = hasConflict ? -1 : 0;
  const harmonyBonus = hasHarmony ? 1 : 0;
  const supportBonus = interactionWithDayMaster === "supportive" ? 1 :
    interactionWithDayMaster === "challenging" ? -1 : 0;

  function rateAspect(base: number): "excellent" | "good" | "neutral" | "challenging" | "difficult" {
    const score = base + supportBonus;
    if (score >= 2) return "excellent";
    if (score >= 1) return "good";
    if (score >= 0) return "neutral";
    if (score >= -1) return "challenging";
    return "difficult";
  }

  // Add conflict/harmony impact
  let careerScore = 1;
  let wealthScore = 1;
  let relationshipScore = 1;
  let healthScore = 1;

  if (hasConflict) {
    careerScore -= 1;
    relationshipScore -= 1;
    healthScore -= 1;
  }
  if (hasHarmony) {
    relationshipScore += 1;
    wealthScore += 1;
  }

  // Generate description
  let description = `Year ${year} is the ${HEAVENLY_STEMS[yearStem]}${EARTHLY_BRANCHES[yearBranch]} year. `;
  if (interactionWithDayMaster === "supportive") {
    description += `${yearElement} energy supports your ${dmElement} Day Master, bringing opportunities and growth. `;
  } else if (interactionWithDayMaster === "challenging") {
    description += `${yearElement} energy challenges your ${dmElement} Day Master, requiring caution and preparation. `;
  } else if (interactionWithDayMaster === "draining") {
    description += `Your energy is drawn toward ${yearElement} matters this year. Conserve your strength. `;
  } else {
    description += `${yearElement} and ${dmElement} are in balance this year. Steady progress is possible. `;
  }
  if (hasConflict) {
    description += "Be aware of conflicting energies in relationships and health. ";
  }
  if (hasHarmony) {
    description += "Harmonious energies support partnerships and wealth. ";
  }

  return {
    year,
    stemIndex: yearStem,
    branchIndex: yearBranch,
    stem: HEAVENLY_STEMS[yearStem],
    branch: EARTHLY_BRANCHES[yearBranch],
    stemEn: STEM_EN[yearStem],
    branchEn: BRANCH_EN[yearBranch],
    stemElement: yearElement,
    branchElement: BRANCH_ELEMENTS[yearBranch],
    interactionWithDayMaster,
    favorableElements,
    challengingElements,
    lifeAspects: {
      career: rateAspect(careerScore),
      wealth: rateAspect(wealthScore),
      relationships: rateAspect(relationshipScore),
      health: rateAspect(healthScore),
    },
    description,
  };
}

/**
 * Calculate annual fortunes for a range of years.
 */
export function calculateAnnualFortunes(
  startYear: number,
  endYear: number,
  dayMasterIndex: number,
  birthYearStem: number,
  birthYearBranch: number
): AnnualFortune[] {
  const fortunes: AnnualFortune[] = [];
  for (let y = startYear; y <= endYear; y++) {
    fortunes.push(calculateAnnualFortune(y, dayMasterIndex, birthYearStem, birthYearBranch));
  }
  return fortunes;
}

/**
 * Get the current year's fortune summary.
 */
export function getCurrentYearFortune(
  dayMasterIndex: number,
  birthYearStem: number,
  birthYearBranch: number
): AnnualFortune {
  return calculateAnnualFortune(
    new Date().getFullYear(),
    dayMasterIndex,
    birthYearStem,
    birthYearBranch
  );
}
