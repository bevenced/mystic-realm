// ===== 大运 (Da Yun / Decade Luck Cycles) =====
// Calculates the 10-year luck cycles that shape a person's life.
// Key rules:
// 1. Direction (forward/backward) based on gender + year stem yin/yang
//    - Yang male (阳男) / Yin female (阴女) → forward direction
//    - Yin male (阴男) / Yang female (阳女) → backward direction
// 2. Starting age based on distance to nearest Jie (节)
// 3. Each cycle = 10 years, advancing through the sexagenary cycle

import { getPreviousJie, getNextJie } from "./solar-terms";

const HEAVENLY_STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const EARTHLY_BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const STEM_EN = ["Yang Wood","Yin Wood","Yang Fire","Yin Fire","Yang Earth","Yin Earth","Yang Metal","Yin Metal","Yang Water","Yin Water"];
const BRANCH_EN = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
const STEM_ELEMENTS = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];
const BRANCH_ELEMENTS = ["Water","Earth","Wood","Wood","Earth","Fire","Fire","Earth","Metal","Metal","Earth","Water"];

export interface DaYunResult {
  startAge: number;        // Age at which first Da Yun starts (may be fractional)
  startYear: number;       // Calendar year
  direction: "forward" | "backward";
  cycles: DaYunCycle[];
}

export interface DaYunCycle {
  index: number;           // 0-based cycle number
  stemIndex: number;       // 0-9
  branchIndex: number;     // 0-11
  stem: string;            // Chinese
  branch: string;
  stemEn: string;
  branchEn: string;
  stemElement: string;
  branchElement: string;
  element: string;         // Combined element (based on Na Yin)
  startAge: number;        // Starting age
  endAge: number;          // Ending age (exclusive)
  startYear: number;       // Calendar start year
  endYear: number;         // Calendar end year
  isCurrent: boolean;      // Is this the current cycle?
}

/**
 * Determine the Da Yun direction.
 * Yang (Yang) year stem = Yang male goes forward, Yang female goes backward
 * Yin (Yin) year stem = Yin male goes backward, Yin female goes forward
 *
 * @param yearStemIndex 0-9
 * @param gender "male" | "female"
 * @returns "forward" or "backward"
 */
export function getDaYunDirection(yearStemIndex: number, gender: "male" | "female"): "forward" | "backward" {
  const isYang = yearStemIndex % 2 === 0; // Even stems are Yang
  // Yang male → forward, Yang female → backward
  // Yin male → backward, Yin female → forward
  return (isYang && gender === "male") || (!isYang && gender === "female")
    ? "forward"
    : "backward";
}

/**
 * Calculate the starting age for Da Yun.
 * Based on distance (in days) from birth date to the nearest Jie (节).
 * 3 days = 1 year, 1 day = 4 months, 1 hour = 5 days.
 *
 * @param birthDate Birth date
 * @param yearStemIndex Year stem index (0-9)
 * @param gender "male" | "female"
 * @returns Starting age (can be fractional, usually rounded up)
 */
export function calculateDaYunStartAge(
  birthDate: Date,
  yearStemIndex: number,
  gender: "male" | "female"
): number {
  const direction = getDaYunDirection(yearStemIndex, gender);

  // Find the relevant Jie
  const { date: jieDate } = direction === "forward"
    ? getNextJie(birthDate)
    : getPreviousJie(birthDate);

  // Calculate distance in days (convert to hours for precision)
  const diffMs = Math.abs(jieDate.getTime() - birthDate.getTime());
  const diffHours = diffMs / (1000 * 60 * 60);

  // Traditional rule: 3 days = 1 year, so 1 day = 1/3 year = 4 months
  // In hours: 72 hours = 1 year, so 1 hour = 1/72 year
  const days = diffHours / 24;
  const startAge = days / 3;

  // Round to 2 decimal places, minimum 0.5
  return Math.max(0.5, Math.round(startAge * 100) / 100);
}

/**
 * Calculate all Da Yun cycles for a person's life.
 * Typically 8 cycles (80 years), but we calculate from birth to age 120.
 */
export function calculateDaYun(
  birthDate: Date,
  yearStemIndex: number,
  monthStemIndex: number,
  monthBranchIndex: number,
  gender: "male" | "female",
  maxCycles: number = 8
): DaYunResult {
  const direction = getDaYunDirection(yearStemIndex, gender);
  const startAge = calculateDaYunStartAge(birthDate, yearStemIndex, gender);
  const birthYear = birthDate.getFullYear();
  const startYear = birthYear + Math.floor(startAge);

  // The first Da Yun pillar starts from the month pillar
  // and advances forward or backward through the sexagenary cycle
  const cycles: DaYunCycle[] = [];
  const now = new Date();
  const currentAge = now.getFullYear() - birthYear;

  for (let i = 0; i < maxCycles; i++) {
    // Step 1: Calculate the stem and branch for this cycle
    // First cycle = month pillar index + 1 (forward) or -1 (backward)
    // Then continue in the same direction
    const step = i + 1;
    const stemOffset = direction === "forward" ? step : -step;
    const branchOffset = direction === "forward" ? step : -step;

    const stemIdx = ((monthStemIndex + stemOffset) % 10 + 10) % 10;
    const branchIdx = ((monthBranchIndex + branchOffset) % 12 + 12) % 12;

    const cycleStartAge = Math.round(startAge + i * 10);
    const cycleEndAge = Math.round(startAge + (i + 1) * 10);
    const cycleStartYear = Math.floor(startYear + i * 10);
    const cycleEndYear = Math.floor(startYear + (i + 1) * 10);

    cycles.push({
      index: i,
      stemIndex: stemIdx,
      branchIndex: branchIdx,
      stem: HEAVENLY_STEMS[stemIdx],
      branch: EARTHLY_BRANCHES[branchIdx],
      stemEn: STEM_EN[stemIdx],
      branchEn: BRANCH_EN[branchIdx],
      stemElement: STEM_ELEMENTS[stemIdx],
      branchElement: BRANCH_ELEMENTS[branchIdx],
      element: BRANCH_ELEMENTS[branchIdx], // Simplified — Na Yin would be more precise
      startAge: cycleStartAge,
      endAge: cycleEndAge,
      startYear: cycleStartYear,
      endYear: cycleEndYear,
      isCurrent: currentAge >= cycleStartAge && currentAge < cycleEndAge,
    });
  }

  return {
    startAge: Math.round(startAge),
    startYear,
    direction,
    cycles,
  };
}

/**
 * Get current Da Yun cycle for display.
 */
export function getCurrentDaYun(daYun: DaYunResult): DaYunCycle | null {
  return daYun.cycles.find((c) => c.isCurrent) || null;
}
