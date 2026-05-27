// ===== 格局 (Chart Pattern / Ge Ju) =====
// Determined by the month branch's primary hidden stem
// and its ten-god relationship to the Day Master.

import { getHiddenStems } from "./hidden-stems";
import { getTenGod } from "./ten-gods";
import type { TenGodResult } from "./ten-gods";

export interface PatternResult {
  /** Chinese pattern name, e.g. "正官格" */
  name: string;
  /** English pattern name, e.g. "Direct Officer Pattern" */
  nameEn: string;
  /** The ten god that forms this pattern */
  tenGod: TenGodResult;
  /** Brief description of what this pattern means */
  description: string;
  /** Category: standard, special (建禄/月刃) */
  category: "standard" | "jianLu" | "yueRen";
}

const PATTERN_NAMES: Record<string, [string, string]> = {
  "正官 Zheng Guan (Direct Officer)": ["正官格", "Direct Officer Pattern"],
  "七杀 Qi Sha (Seven Kill)": ["七杀格", "Seven Kill Pattern"],
  "正财 Zheng Cai (Direct Wealth)": ["正财格", "Direct Wealth Pattern"],
  "偏财 Pian Cai (Indirect Wealth)": ["偏财格", "Indirect Wealth Pattern"],
  "正印 Zheng Yin (Direct Resource)": ["正印格", "Direct Resource Pattern"],
  "偏印 Pian Yin (Indirect Resource)": ["偏印格", "Indirect Resource Pattern"],
  "食神 Shi Shen (Eating God)": ["食神格", "Eating God Pattern"],
  "伤官 Shang Guan (Hurting Officer)": ["伤官格", "Hurting Officer Pattern"],
  "比肩 Bi Jian (Sibling)": ["建禄格", "Jian Lu Pattern"],
  "劫财 Jie Cai (Rob Wealth)": ["月刃格", "Yue Ren Pattern"],
};

const PATTERN_DESCRIPTIONS: Record<string, string> = {
  "正官格": "正官为贵气之神，主事业有成、品行端正。正直负责，适合公职管理。",
  "七杀格": "七杀为权柄之星，主果敢决断、竞争突破。魄力十足，适合挑战性工作。",
  "正财格": "正财为稳定财源，主勤俭持家、踏实积累。适合稳定职业与长期投资。",
  "偏财格": "偏财为流动之财，主商业头脑、投资眼光。适合经商贸易、金融投机。",
  "正印格": "正印为慈爱之神，主学识渊博、心地善良。适合教育文化、研究学术。",
  "偏印格": "偏印为特殊才能，主独特思维、另辟蹊径。适合专业技术、创新领域。",
  "食神格": "食神为福寿之星，主温和乐观、才华横溢。适合艺术创作、餐饮美食。",
  "伤官格": "伤官为聪慧之星，主机智灵敏、表达力强。适合演艺传媒、设计创意。",
  "建禄格": "建禄为自旺之格，主自立自强、根基稳固。白手起家，靠自身努力成事。",
  "月刃格": "月刃为刚强之格，主个性强烈、行动力强。需注意柔韧平衡，避免过于刚硬。",
};

/**
 * Calculate the Chart Pattern (格局) based on month branch's primary qi and day master.
 * @param monthBranchIndex - Month pillar branch index (0-11)
 * @param dayMasterIndex - Day master stem index (0-9)
 */
export function calculatePattern(
  monthBranchIndex: number,
  dayMasterIndex: number,
): PatternResult {
  const monthStems = getHiddenStems(monthBranchIndex);
  const primaryStem = monthStems[0]; // 主气 determines the pattern

  const dayMasterYinYang = dayMasterIndex % 2 === 0 ? "Yang" : "Yin";
  const tenGod = getTenGod(dayMasterIndex, dayMasterYinYang, primaryStem.stemIndex);

  const patternKey = tenGod.tenGodName;
  const [name, nameEn] = PATTERN_NAMES[patternKey] || [patternKey, patternKey];
  const description = PATTERN_DESCRIPTIONS[name] || "";

  const category = name === "建禄格" ? "jianLu" : name === "月刃格" ? "yueRen" : "standard";

  return { name, nameEn, tenGod, description, category };
}
