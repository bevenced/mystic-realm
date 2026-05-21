// ===== 五行强度 (Five Element Strength Analysis) =====
// Professional element strength calculation including:
// - Seasonal (month) strength — 得令/失令
// - Hidden stem contributions
// - Day Master strength (身强/身弱)
// - 用神 (Useful God) determination
// - Element interaction scoring

export interface ElementStrengthResult {
  // Raw count of each element in the 4 pillars (8 positions + hidden stems)
  counts: {
    Wood: number;
    Fire: number;
    Earth: number;
    Metal: number;
    Water: number;
  };
  // Weighted score (hidden stems contribute partial values)
  weightedScores: {
    Wood: number;
    Fire: number;
    Earth: number;
    Metal: number;
    Water: number;
  };
  // Seasonal strength: whether the Day Master is in its season
  seasonalStrength: {
    monthBranch: number;     // 0-11
    seasonElement: string;   // Element dominant in this month
    dmInSeason: boolean;     // Is Day Master in its own season?
    isInSeason: boolean;     // Does Day Master get seasonal support?
    seasonPower: number;     // -2 to +2, how strong the seasonal influence is
  };
  // Day Master strength assessment
  dayMasterStrength: {
    level: "veryWeak" | "weak" | "neutral" | "strong" | "veryStrong";
    score: number;           // 0-100
    description: string;
    isStrong: boolean;       // Convenience: strong or veryStrong
  };
  // Useful God (用神) — the element that best balances the chart
  usefulGod: {
    element: string;
    reason: string;
  } | null;
}

const ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"];

// Season-element mapping: Spring=Wood, Summer=Fire, Autumn=Metal, Winter=Water
// Earth is the transitional element (each season's last month)
const MONTH_TO_SEASON: Record<number, string> = {
  1: "Wood",   // 寅 (Tiger) = Spring
  2: "Wood",   // 卯 (Rabbit) = Spring
  3: "Earth",  // 辰 (Dragon) = Transitional
  4: "Fire",   // 巳 (Snake) = Summer
  5: "Fire",   // 午 (Horse) = Summer
  6: "Earth",  // 未 (Goat) = Transitional
  7: "Metal",  // 申 (Monkey) = Autumn
  8: "Metal",  // 酉 (Rooster) = Autumn
  9: "Earth",  // 戌 (Dog) = Transitional
  10: "Water", // 亥 (Pig) = Winter
  11: "Water", // 子 (Rat) = Winter
  0: "Earth",  // 丑 (Ox) = Transitional
};

// Branch element for seasonal scoring
const BRANCH_ELEMENTS = ["Water","Earth","Wood","Wood","Earth","Fire","Fire","Earth","Metal","Metal","Earth","Water"];

/**
 * Calculate weighted element strength considering:
 * - Direct pillar positions (8 stem+branch positions)
 * - Hidden stems in branches
 * - Seasonal factor (month branch)
 */
export function calculateElementStrength(
  pillarStemIndices: number[],    // [yearStem, monthStem, dayStem, hourStem]
  pillarBranchIndices: number[],  // [yearBranch, monthBranch, dayBranch, hourBranch]
  dayMasterIndex: number,
  includeHiddenStems: boolean = true
): ElementStrengthResult {
  // === Step 1: Raw counts from 8 visible positions ===
  const counts: Record<string, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  const weightedScores: Record<string, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  const STEM_ELEMENTS = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];

  // Count stems and branches (each visible position = 1 point)
  for (let i = 0; i < 4; i++) {
    const se = STEM_ELEMENTS[pillarStemIndices[i]];
    const be = BRANCH_ELEMENTS[pillarBranchIndices[i]];
    counts[se] = (counts[se] || 0) + 1;
    counts[be] = (counts[be] || 0) + 1;
    weightedScores[se] = (weightedScores[se] || 0) + 1;
    weightedScores[be] = (weightedScores[be] || 0) + 0.7; // Branch = 0.7 weight
  }

  // Also count day master stem (it's already counted above in stem elements)
  // Note: Day stem element is both the Day Master and a pillar stem, already counted

  // === Step 2: Hidden stem contributions ===
  if (includeHiddenStems) {
    // Hidden stem weight: primary=0.5, secondary=0.3, tertiary=0.1
    const HIDDEN_STEMS: Record<number, Array<{ element: string; qi: string }>> = {
      0: [{ element: "Water", qi: "primary" }],
      1: [{ element: "Earth", qi: "primary" }, { element: "Water", qi: "secondary" }, { element: "Metal", qi: "tertiary" }],
      2: [{ element: "Wood", qi: "primary" }, { element: "Fire", qi: "secondary" }, { element: "Earth", qi: "tertiary" }],
      3: [{ element: "Wood", qi: "primary" }],
      4: [{ element: "Earth", qi: "primary" }, { element: "Wood", qi: "secondary" }, { element: "Water", qi: "tertiary" }],
      5: [{ element: "Fire", qi: "primary" }, { element: "Metal", qi: "secondary" }, { element: "Earth", qi: "tertiary" }],
      6: [{ element: "Fire", qi: "primary" }, { element: "Earth", qi: "secondary" }],
      7: [{ element: "Earth", qi: "primary" }, { element: "Fire", qi: "secondary" }, { element: "Wood", qi: "tertiary" }],
      8: [{ element: "Metal", qi: "primary" }, { element: "Water", qi: "secondary" }, { element: "Earth", qi: "tertiary" }],
      9: [{ element: "Metal", qi: "primary" }],
      10: [{ element: "Earth", qi: "primary" }, { element: "Metal", qi: "secondary" }, { element: "Fire", qi: "tertiary" }],
      11: [{ element: "Water", qi: "primary" }, { element: "Wood", qi: "secondary" }],
    };

    for (const bi of pillarBranchIndices) {
      const hidden = HIDDEN_STEMS[bi] || [];
      for (const h of hidden) {
        const w = h.qi === "primary" ? 0.5 : h.qi === "secondary" ? 0.3 : 0.1;
        weightedScores[h.element] = (weightedScores[h.element] || 0) + w;
      }
    }
  }

  // === Step 3: Seasonal strength ===
  const monthBranch = pillarBranchIndices[1]; // Month pillar branch
  const seasonElement = MONTH_TO_SEASON[monthBranch] || "Earth";
  const dmElement = STEM_ELEMENTS[dayMasterIndex];

  // Determine seasonal support for each element
  // Wood prospers in Spring (month branches 寅卯), Fire in Summer (巳午), etc.
  // Earth prospers in transitional months (辰未戌丑)
  const isInSeason = dmElement === seasonElement;

  // Also check the producing element season (e.g., Wood gets support in Winter too)
  const CYCLE = ["Wood", "Fire", "Earth", "Metal", "Water"];
  const dmSeasonIdx = CYCLE.indexOf(dmElement);
  const producingElement = CYCLE[(dmSeasonIdx + 3) % 5]; // The element that produces this one
  const seasonPower = isInSeason ? 1 : (dmElement === CYCLE[(CYCLE.indexOf(seasonElement) + 3) % 5] ? 0.5 : 0);
  const dmInSeason = isInSeason;

  // === Step 4: Day Master strength assessment ===
  // Factors: seasonal support + element count + hidden stem support + branch support
  let strengthScore = 30; // baseline

  // Seasonal: +20 if in season, +10 if in producing season
  if (dmInSeason) strengthScore += 20;
  else {
    const producingOfSeason = CYCLE[(CYCLE.indexOf(seasonElement) + 3) % 5];
    if (dmElement === producingOfSeason) strengthScore += 10;
  }

  // Raw count: each occurrence of DM element in pillars = +5
  strengthScore += (counts[dmElement] || 0) * 5;

  // Weighted score contribution
  strengthScore += Math.round((weightedScores[dmElement] || 0) * 3);

  // Same-element branch support (branch element = DM element = +3 each)
  for (const bi of pillarBranchIndices) {
    if (BRANCH_ELEMENTS[bi] === dmElement) strengthScore += 3;
  }

  // Clamp to 0-100
  strengthScore = Math.max(0, Math.min(100, strengthScore));

  const isStrong = strengthScore >= 55;
  let level: "veryWeak" | "weak" | "neutral" | "strong" | "veryStrong";
  if (strengthScore >= 75) level = "veryStrong";
  else if (strengthScore >= 55) level = "strong";
  else if (strengthScore >= 40) level = "neutral";
  else if (strengthScore >= 25) level = "weak";
  else level = "veryWeak";

  // === Step 5: Useful God (用神) ===
  // The Useful God is the element that best balances the chart:
  // - If DM is strong, the controlling element is useful (to reduce excess)
  // - If DM is weak, the producing element is useful (to strengthen)
  // - If neutral, look at what's lacking
  let usefulGod: { element: string; reason: string } | null = null;

  if (isStrong) {
    // Need to control/reduce the DM: controlling element
    const controllingIdx = (dmSeasonIdx + 4) % 5;
    usefulGod = {
      element: CYCLE[controllingIdx],
      reason: `Day Master is ${level} (${strengthScore}/100). ${CYCLE[controllingIdx]} element controls and balances the strong ${dmElement} energy.`,
    };
  } else if (strengthScore < 40) {
    // Need to strengthen the DM: producing element
    const producingIdx = (dmSeasonIdx + 3) % 5;
    usefulGod = {
      element: CYCLE[producingIdx],
      reason: `Day Master is ${level} (${strengthScore}/100). ${CYCLE[producingIdx]} element nurtures and strengthens the ${dmElement} Day Master.`,
    };
  } else {
    // Check which element is most lacking (count + weighted)
    const lackingElement = ELEMENTS.reduce((min, e) =>
      (weightedScores[e] || 0) < (weightedScores[min] || 0) ? e : min
    , ELEMENTS[0]);
    if ((weightedScores[lackingElement] || 0) < 1.5) {
      usefulGod = {
        element: lackingElement,
        reason: `${lackingElement} element is the most deficient and can bring balance to the chart.`,
      };
    }
  }

  return {
    counts: { Wood: counts.Wood, Fire: counts.Fire, Earth: counts.Earth, Metal: counts.Metal, Water: counts.Water },
    weightedScores: {
      Wood: Math.round(weightedScores.Wood * 10) / 10,
      Fire: Math.round(weightedScores.Fire * 10) / 10,
      Earth: Math.round(weightedScores.Earth * 10) / 10,
      Metal: Math.round(weightedScores.Metal * 10) / 10,
      Water: Math.round(weightedScores.Water * 10) / 10,
    },
    seasonalStrength: {
      monthBranch,
      seasonElement,
      dmInSeason,
      isInSeason,
      seasonPower,
    },
    dayMasterStrength: {
      level,
      score: strengthScore,
      description: getStrengthDescription(dmElement, level),
      isStrong,
    },
    usefulGod,
  };
}

function getStrengthDescription(element: string, level: string): string {
  const desc: Record<string, Record<string, string>> = {
    Wood: {
      veryStrong: "Wood is extremely abundant — strong-willed and competitive, needs Metal to shape it.",
      strong: "Wood is well-supported — creative and expansive, but may need Metal pruning.",
      neutral: "Wood is balanced — adaptable and resilient with good growth potential.",
      weak: "Wood is somewhat lacking — may lack confidence; needs Water nourishment.",
      veryWeak: "Wood is very scarce — easily overwhelmed; needs significant Water support.",
    },
    Fire: {
      veryStrong: "Fire is intensely bright — passionate and charismatic, needs Water to cool.",
      strong: "Fire is strong — warm and inspiring, but may need Water for balance.",
      neutral: "Fire is balanced — enthusiastic yet grounded with steady energy.",
      weak: "Fire is somewhat dim — may lack motivation; needs Wood to fuel it.",
      veryWeak: "Fire is barely flickering — easily extinguished; needs strong Wood support.",
    },
    Earth: {
      veryStrong: "Earth is extremely solid — reliable and stubborn, needs Wood to loosen.",
      strong: "Earth is firm — stable and dependable, may need Wood for flexibility.",
      neutral: "Earth is balanced — nurturing and practical with good adaptability.",
      weak: "Earth is somewhat loose — may lack direction; needs Fire to strengthen.",
      veryWeak: "Earth is very unstable — easily moved; needs strong Fire support.",
    },
    Metal: {
      veryStrong: "Metal is extremely hard — decisive and sharp, needs Fire to temper.",
      strong: "Metal is strong — structured and determined, may need Fire for flexibility.",
      neutral: "Metal is balanced — precise and reliable with good strength.",
      weak: "Metal is somewhat soft — may lack conviction; needs Earth to strengthen.",
      veryWeak: "Metal is very weak — easily bent; needs strong Earth support.",
    },
    Water: {
      veryStrong: "Water is overwhelmingly deep — intuitive and powerful, needs Earth to contain.",
      strong: "Water is strong — adaptable and wise, may need Earth for boundaries.",
      neutral: "Water is balanced — flowing yet focused with good emotional depth.",
      weak: "Water is shallow — may lack direction; needs Metal to nourish.",
      veryWeak: "Water is barely a trickle — easily depleted; needs strong Metal support.",
    },
  };
  return (desc[element]?.[level]) || "Element strength is balanced.";
}
