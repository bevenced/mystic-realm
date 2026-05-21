// ===== 十神 (Ten Gods / Shi Shen) =====
// The Ten Gods describe the relationship between any Heavenly Stem
// and the Day Master (日主). Based on element AND yin/yang.
//
// Five Elements cycle:
//   Same (同我) → 比劫 (Sibling/Rob Wealth)
//   Produce me (生我) → 印枭 (Resource/Seal)
//   I produce (我生) → 食伤 (Eating God/Hurting Officer)
//   Control me (克我) → 官杀 (Officer/Seven Kill)
//   I control (我克) → 财才 (Wealth)
//
// 同阴阳 = same polarity, 异阴阳 = opposite polarity

export interface TenGodResult {
  stem: string;         // Chinese character of the stem
  stemIndex: number;    // 0-9
  element: string;      // Wood, Fire, Earth, Metal, Water
  yinYang: "Yang" | "Yin";
  tenGodName: string;   // Chinese
  tenGodEn: string;     // English
  relationship: "self" | "resource" | "output" | "wealth" | "power";
  isSamePolarity: boolean;
}

const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const STEM_ELEMENTS = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];

// The Ten God names
const TEN_GODS: Record<string, [string, string]> = {
  // [same polarity, opposite polarity]
  // 同我 (Same element)
  same: ["比肩 Bi Jian (Sibling)", "劫财 Jie Cai (Rob Wealth)"],
  // 生我 (Produces me)
  produceMe: ["偏印 Pian Yin (Indirect Resource)", "正印 Zheng Yin (Direct Resource)"],
  // 我生 (I produce)
  iProduce: ["食神 Shi Shen (Eating God)", "伤官 Shang Guan (Hurting Officer)"],
  // 克我 (Controls me)
  controlMe: ["七杀 Qi Sha (Seven Kill)", "正官 Zheng Guan (Direct Officer)"],
  // 我克 (I control)
  iControl: ["偏财 Pian Cai (Indirect Wealth)", "正财 Zheng Cai (Direct Wealth)"],
};

const RELATIONSHIP_MAP: Record<string, string> = {
  same: "sibling",
  produceMe: "resource",
  iProduce: "output",
  controlMe: "power",
  iControl: "wealth",
};

/**
 * Get the five-element relationship between two stems.
 * Returns the relationship category based on Day Master.
 */
function getRelationCategory(dmElement: string, dmYinYang: string, stemIdx: number): {
  category: string;
  isSamePolarity: boolean;
} {
  const stemElement = STEM_ELEMENTS[stemIdx];
  const stemYinYang = stemIdx % 2 === 0 ? "Yang" : "Yin";
  const samePolarity = dmYinYang === stemYinYang;

  // Element interaction cycle:
  // Wood → Fire → Earth → Metal → Water → Wood
  const cycle = ["Wood", "Fire", "Earth", "Metal", "Water"];

  const dmIdx = cycle.indexOf(dmElement);
  const stIdx = cycle.indexOf(stemElement);

  if (dmElement === stemElement) {
    return { category: "same", isSamePolarity: samePolarity };
  }

  // Element that produces Wood is Water, produces Fire is Wood, etc.
  // Moving backward in cycle
  const producesMeIdx = (dmIdx + 3) % 5; // e.g., Water produces Wood
  if (stIdx === producesMeIdx) {
    return { category: "produceMe", isSamePolarity: samePolarity };
  }

  // Element that Wood produces is Fire, etc.
  // Moving forward in cycle
  const iProduceIdx = (dmIdx + 1) % 5;
  if (stIdx === iProduceIdx) {
    return { category: "iProduce", isSamePolarity: samePolarity };
  }

  // Element that controls Wood is Metal (Metal cuts Wood)
  const controlsMeIdx = (dmIdx + 4) % 5;
  if (stIdx === controlsMeIdx) {
    return { category: "controlMe", isSamePolarity: samePolarity };
  }

  // Element that Wood controls is Earth
  const iControlIdx = (dmIdx + 2) % 5;
  if (stIdx === iControlIdx) {
    return { category: "iControl", isSamePolarity: samePolarity };
  }

  return { category: "same", isSamePolarity: true };
}

/**
 * Get the Ten God for a stem relative to a Day Master.
 * @param dayMasterIndex 0-9 index of the Day Master stem
 * @param dayMasterYinYang "Yang" or "Yin"
 * @param targetStemIndex 0-9 index of the stem to evaluate
 */
export function getTenGod(
  dayMasterIndex: number,
  dayMasterYinYang: string,
  targetStemIndex: number
): TenGodResult {
  const dmElement = STEM_ELEMENTS[dayMasterIndex];
  const { category, isSamePolarity } = getRelationCategory(dmElement, dayMasterYinYang, targetStemIndex);

  const polarityKey = isSamePolarity ? "same" : "opposite";
  const [tenGodFull] = TEN_GODS[category];
  const [tenGodSame, tenGodOpposite] = TEN_GODS[category];
  const tenGodName = isSamePolarity ? tenGodSame : tenGodOpposite;

  return {
    stem: STEMS[targetStemIndex],
    stemIndex: targetStemIndex,
    element: STEM_ELEMENTS[targetStemIndex],
    yinYang: targetStemIndex % 2 === 0 ? "Yang" : "Yin",
    tenGodName,
    tenGodEn: category,
    relationship: RELATIONSHIP_MAP[category] as any,
    isSamePolarity,
  };
}

/**
 * Get Ten Gods for all four pillars' stems relative to the Day Master.
 */
export function getAllTenGods(dayMasterIndex: number, pillarStemIndices: number[]): TenGodResult[] {
  const dmYinYang = dayMasterIndex % 2 === 0 ? "Yang" : "Yin";
  return pillarStemIndices.map((si) => getTenGod(dayMasterIndex, dmYinYang, si));
}
