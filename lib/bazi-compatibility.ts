// ===== 合盘 (BaZi Compatibility / Relationship Matching) =====
// Compares two BaZi charts for relationship compatibility.
// Based on: pillar interactions, element harmony, zodiac compatibility.

import { calculateBaZi, type BaZiResult } from "./bazi-engine/pillars";
import { getTenGod } from "./bazi-engine/ten-gods";
import type { TenGodResult } from "./bazi-engine/ten-gods";
import { calculateElementStrength } from "./bazi-engine/elements";
import { calculateShenSha } from "./bazi-engine/shensha";

export interface CompatibilityResult {
  overallScore: number;          // 0-100
  scoreLevel: "excellent" | "good" | "average" | "challenging" | "difficult";

  // Individual category scores
  categories: {
    elementHarmony: number;      // 0-100
    pillarInteraction: number;   // 0-100
    zodiacCompatibility: number; // 0-100
    dayMasterBalance: number;    // 0-100
    lifeAspectAlignment: number; // 0-100
  };

  // Detailed analysis
  analysis: {
    strengths: string[];
    challenges: string[];
    advice: string[];
  };

  // Pillar-by-pillar comparison
  pillarComparisons: Array<{
    pillar: string;
    person1: string;
    person2: string;
    interaction: string;
    score: number;               // 0-100
  }>;

  // Element analysis
  elementComparison: {
    person1Dominant: string;
    person2Dominant: string;
    interaction: string;
    naturalAffinity: "high" | "medium" | "low";
  };
}

const BRANCH_EN = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
const STEM_ELEMENTS = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];

// Zodiac compatibility (traditional Chinese match)
// 6 compatible pairs (六合), 4 neutral groups, conflicting pairs (六冲)
const ZODIAC_COMPATIBILITY: Record<string, { compatible: number[]; conflicting: number[] }> = {
  // Rat
  "0": { compatible: [1, 8, 4], conflicting: [6] },
  // Ox
  "1": { compatible: [0, 5, 8], conflicting: [7] },
  // Tiger
  "2": { compatible: [11, 6, 10], conflicting: [8] },
  // Rabbit
  "3": { compatible: [10, 6, 0], conflicting: [9] },
  // Dragon
  "4": { compatible: [9, 0, 1], conflicting: [10] },
  // Snake
  "5": { compatible: [8, 1, 11], conflicting: [11] },
  // Horse
  "6": { compatible: [7, 2, 3], conflicting: [0] },
  // Goat
  "7": { compatible: [6, 8, 2], conflicting: [1] },
  // Monkey
  "8": { compatible: [5, 1, 7], conflicting: [2] },
  // Rooster
  "9": { compatible: [4, 0, 10], conflicting: [3] },
  // Dog
  "10": { compatible: [3, 11, 9], conflicting: [4] },
  // Pig
  "11": { compatible: [2, 5, 3], conflicting: [5] },
};

/**
 * Calculate compatibility between two people based on their BaZi charts.
 */
export function calculateCompatibility(
  person1: { year: number; month: number; day: number; hour: number; gender: "male" | "female" },
  person2: { year: number; month: number; day: number; hour: number; gender: "male" | "female" }
): CompatibilityResult {
  const chart1 = calculateBaZi(person1.year, person1.month, person1.day, person1.hour);
  const chart2 = calculateBaZi(person2.year, person2.month, person2.day, person2.hour);

  // === Category 1: Element Harmony (30% weight) ===
  const elementHarmony = calculateElementHarmony(chart1, chart2);

  // === Category 2: Pillar Interaction (25% weight) ===
  const pillarInteraction = calculatePillarInteraction(chart1, chart2);

  // === Category 3: Zodiac Compatibility (15% weight) ===
  const zodiacCompatibility = calculateZodiacCompatibility(chart1, chart2);

  // === Category 4: Day Master Balance (20% weight) ===
  const dayMasterBalance = calculateDayMasterBalance(chart1, chart2);

  // === Category 5: Life Aspect Alignment (10% weight) ===
  const lifeAspectAlignment = calculateLifeAspectAlignment(chart1, chart2);

  // === Overall Score ===
  const overallScore = Math.round(
    elementHarmony * 0.30 +
    pillarInteraction * 0.25 +
    zodiacCompatibility * 0.15 +
    dayMasterBalance * 0.20 +
    lifeAspectAlignment * 0.10
  );

  let scoreLevel: "excellent" | "good" | "average" | "challenging" | "difficult";
  if (overallScore >= 80) scoreLevel = "excellent";
  else if (overallScore >= 65) scoreLevel = "good";
  else if (overallScore >= 50) scoreLevel = "average";
  else if (overallScore >= 35) scoreLevel = "challenging";
  else scoreLevel = "difficult";

  // === Pillar Comparisons ===
  const pillarComparisons = buildPillarComparisons(chart1, chart2);

  // === Analysis Text ===
  const strengths: string[] = [];
  const challenges: string[] = [];
  const advice: string[] = [];

  if (elementHarmony >= 70) {
    strengths.push("Strong elemental harmony — your Five Element energies naturally complement each other.");
  } else {
    challenges.push("Elemental friction — your core elements may clash, requiring understanding and compromise.");
  }

  if (pillarInteraction >= 70) {
    strengths.push("Excellent pillar interaction — your life pillars align well across key areas.");
  } else if (pillarInteraction >= 50) {
    strengths.push("Moderate pillar alignment — shared values exist with some areas of difference.");
  } else {
    challenges.push("Pillar conflicts suggest differing life approaches that need conscious harmonization.");
  }

  if (zodiacCompatibility >= 70) {
    strengths.push("Traditional zodiac compatibility — your animal signs are a well-matched pair.");
  } else if (zodiacCompatibility < 40) {
    challenges.push("Zodiac conflict — traditional matching indicates potential friction areas.");
  }

  if (dayMasterBalance >= 70) {
    strengths.push("Balanced Day Masters — your core energies support rather than overwhelm each other.");
  } else {
    advice.push("Work on balancing your core energies — understanding each other's fundamental nature is key.");
  }

  // Generic advice
  advice.push("Open communication about your different strengths creates the strongest foundation.");
  if (overallScore >= 65) {
    advice.push("Your charts show strong potential for a harmonious long-term relationship.");
  } else {
    advice.push("With awareness and effort, your differences can become complementary strengths.");
  }

  return {
    overallScore,
    scoreLevel,
    categories: {
      elementHarmony: Math.round(elementHarmony),
      pillarInteraction: Math.round(pillarInteraction),
      zodiacCompatibility: Math.round(zodiacCompatibility),
      dayMasterBalance: Math.round(dayMasterBalance),
      lifeAspectAlignment: Math.round(lifeAspectAlignment),
    },
    analysis: { strengths, challenges, advice },
    pillarComparisons,
    elementComparison: {
      person1Dominant: chart1.dayMasterElement,
      person2Dominant: chart2.dayMasterElement,
      interaction: getElementInteraction(chart1.dayMasterElement, chart2.dayMasterElement),
      naturalAffinity: elementHarmony >= 65 ? "high" : elementHarmony >= 45 ? "medium" : "low",
    },
  };
}

function calculateElementHarmony(c1: BaZiResult, c2: BaZiResult): number {
  const cycle = ["Wood", "Fire", "Earth", "Metal", "Water"];
  const e1 = c1.dayMasterElement;
  const e2 = c2.dayMasterElement;

  if (e1 === e2) return 70; // Same element = harmony but can be repetitive

  const i1 = cycle.indexOf(e1);
  const i2 = cycle.indexOf(e2);

  // Producing cycle (e.g., Water produces Wood, Wood produces Fire)
  if ((i1 + 1) % 5 === i2 || (i2 + 1) % 5 === i1) return 85;
  if ((i1 + 3) % 5 === i2 || (i2 + 3) % 5 === i1) return 80;

  // Controlling cycle (e.g., Metal controls Wood)
  if ((i1 + 4) % 5 === i2 || (i2 + 4) % 5 === i1) return 40;

  // Draining
  if ((i1 + 2) % 5 === i2 || (i2 + 2) % 5 === i1) return 55;

  return 50;
}

function calculatePillarInteraction(c1: BaZiResult, c2: BaZiResult): number {
  let totalScore = 0;
  const pairs = [
    { p1: c1.year, p2: c2.year, name: "Year" },
    { p1: c1.month, p2: c2.month, name: "Month" },
    { p1: c1.day, p2: c2.day, name: "Day" },
    { p1: c1.hour, p2: c2.hour, name: "Hour" },
  ];

  for (const { p1, p2 } of pairs) {
    // Stem same element
    if (p1.stemElement === p2.stemElement) totalScore += 20;
    // Branch same
    if (p1.branch === p2.branch) totalScore += 15;
    // Six Harmony branches
    const p1b = p1.branchIndex;
    const p2b = p2.branchIndex;
    if (isSixHarmony(p1b, p2b)) totalScore += 25;
    // Supplementing elements (one produces the other)
    if (isProducing(p1.stemElement, p2.stemElement)) totalScore += 20;
  }

  return Math.min(100, Math.round(totalScore / 4));
}

function calculateZodiacCompatibility(c1: BaZiResult, c2: BaZiResult): number {
  const b1 = c1.year.branchIndex;
  const b2 = c2.year.branchIndex;
  const compat = ZODIAC_COMPATIBILITY[b1.toString()] || { compatible: [], conflicting: [] };

  if (compat.compatible.includes(b2)) return 90;
  if (compat.conflicting.includes(b2)) return 25;

  // Check for same zodiac
  if (b1 === b2) return 50;

  return 60;
}

function calculateDayMasterBalance(c1: BaZiResult, c2: BaZiResult): number {
  const e1 = c1.dayMasterElement;
  const e2 = c2.dayMasterElement;
  const cycle = ["Wood", "Fire", "Earth", "Metal", "Water"];
  const i1 = cycle.indexOf(e1);
  const i2 = cycle.indexOf(e2);

  // Opposite elements in the cycle balance well
  const diff = Math.abs(i1 - i2);
  if (diff === 2) return 85; // Complementary (e.g., Wood-Earth)

  // Producing support
  if ((i1 + 1) % 5 === i2 || (i2 + 1) % 5 === i1) return 75;
  if ((i1 + 3) % 5 === i2 || (i2 + 3) % 5 === i1) return 70;

  // Same
  if (i1 === i2) return 60;

  // Controlling
  return 40;
}

function calculateLifeAspectAlignment(c1: BaZiResult, c2: BaZiResult): number {
  // Compare element counts — similar distributions suggest aligned life priorities
  const e1 = c1.elementCounts;
  const e2 = c2.elementCounts;
  const elements = ["Wood", "Fire", "Earth", "Metal", "Water"];

  let diff = 0;
  for (const el of elements) {
    diff += Math.abs((e1 as any)[el] - (e2 as any)[el]);
  }
  // Lower diff = more aligned
  const score = Math.max(0, 100 - diff * 15);
  return score;
}

function buildPillarComparisons(c1: BaZiResult, c2: BaZiResult) {
  const pillars = [
    { name: "Year Pillar", p1: c1.year, p2: c2.year },
    { name: "Month Pillar", p1: c1.month, p2: c2.month },
    { name: "Day Pillar", p1: c1.day, p2: c2.day },
    { name: "Hour Pillar", p1: c1.hour, p2: c2.hour },
  ];

  return pillars.map(({ name, p1, p2 }) => {
    let score = 50;
    const interactions: string[] = [];

    if (p1.stemElement === p2.stemElement) {
      score += 20;
      interactions.push(`Same ${p1.stemElement} element`);
    }
    if (p1.branch === p2.branch) {
      score += 15;
      interactions.push(`Same ${p1.branchEn} branch`);
    }
    if (isSixHarmony(p1.branchIndex, p2.branchIndex)) {
      score += 20;
      interactions.push("Six Harmony (六合)");
    }
    if (isProducing(p1.stemElement, p2.stemElement)) {
      score += 15;
      interactions.push("Supportive element");
    }

    return {
      pillar: name,
      person1: `${p1.stem}${p1.branch} (${p1.stemEn})`,
      person2: `${p2.stem}${p2.branch} (${p2.stemEn})`,
      interaction: interactions.join(", ") || "Neutral",
      score: Math.min(100, Math.round(score)),
    };
  });
}

function isSixHarmony(b1: number, b2: number): boolean {
  const harmonies: Record<number, number> = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
  return harmonies[b1] === b2;
}

function isProducing(e1: string, e2: string): boolean {
  const cycle = ["Wood", "Fire", "Earth", "Metal", "Water"];
  const i1 = cycle.indexOf(e1);
  const i2 = cycle.indexOf(e2);
  return (i1 + 3) % 5 === i2 || (i2 + 3) % 5 === i1;
}

function getElementInteraction(e1: string, e2: string): string {
  const cycle = ["Wood", "Fire", "Earth", "Metal", "Water"];
  const i1 = cycle.indexOf(e1);
  const i2 = cycle.indexOf(e2);

  if (e1 === e2) return `Both share ${e1} energy — strong resonance but potential competition.`;
  if ((i1 + 1) % 5 === i2) return `${e1} produces ${e2} — natural support flows from Person 1 to Person 2.`;
  if ((i2 + 1) % 5 === i1) return `${e2} produces ${e1} — natural support flows from Person 2 to Person 1.`;
  if ((i1 + 4) % 5 === i2) return `${e1} controls ${e2} — Person 1's energy moderates Person 2.`;
  if ((i2 + 4) % 5 === i1) return `${e2} controls ${e1} — Person 2's energy moderates Person 1.`;
  return `${e1} and ${e2} have a neutral relationship.`;
}
