// ===== 四柱关系 (Four Pillar Relations) =====
// Detects combinations (合), clashes (冲), harms (害), and punishments (刑)
// between adjacent pillars in the BaZi chart.

export interface PillarRelation {
  /** Type of relation */
  type: "combine" | "clash" | "harm" | "punish" | "tripleCombine";
  /** Chinese label */
  label: string;
  /** English label */
  labelEn: string;
  /** Which pillars are involved (e.g. ["Year","Month"]) */
  pillars: string[];
  /** Brief description */
  description: string;
  /** Direction indicator for diagram: which pillars to connect */
  fromIndex: number; // 0=Year, 1=Month, 2=Day, 3=Hour
  toIndex: number;
}

const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const PILLAR_NAMES = ["Year","Month","Day","Hour"];

// 天干五合: 甲己合土, 乙庚合金, 丙辛合水, 丁壬合木, 戊癸合火
const STEM_COMBINE: Record<number, { with: number; element: string; label: string }> = {
  0: { with: 5, element: "Earth", label: "甲己合土" },
  1: { with: 6, element: "Metal", label: "乙庚合金" },
  2: { with: 7, element: "Water", label: "丙辛合水" },
  3: { with: 8, element: "Wood", label: "丁壬合木" },
  4: { with: 9, element: "Fire", label: "戊癸合火" },
  5: { with: 0, element: "Earth", label: "甲己合土" },
  6: { with: 1, element: "Metal", label: "乙庚合金" },
  7: { with: 2, element: "Water", label: "丙辛合水" },
  8: { with: 3, element: "Wood", label: "丁壬合木" },
  9: { with: 4, element: "Fire", label: "戊癸合火" },
};

// 地支六合: 子丑合土, 寅亥合木, 卯戌合火, 辰酉合金, 巳申合水, 午未合火
const BRANCH_COMBINE: Record<number, { with: number; element: string; label: string }> = {
  0: { with: 1, element: "Earth", label: "子丑合土" },
  1: { with: 0, element: "Earth", label: "子丑合土" },
  2: { with: 11, element: "Wood", label: "寅亥合木" },
  3: { with: 10, element: "Fire", label: "卯戌合火" },
  4: { with: 9, element: "Metal", label: "辰酉合金" },
  5: { with: 8, element: "Water", label: "巳申合水" },
  6: { with: 7, element: "Fire", label: "午未合火" },
  7: { with: 6, element: "Fire", label: "午未合火" },
  8: { with: 5, element: "Water", label: "巳申合水" },
  9: { with: 4, element: "Metal", label: "辰酉合金" },
  10: { with: 3, element: "Fire", label: "卯戌合火" },
  11: { with: 2, element: "Wood", label: "寅亥合木" },
};

// 地支六冲: 子午冲, 丑未冲, 寅申冲, 卯酉冲, 辰戌冲, 巳亥冲
const BRANCH_CLASH: Record<number, number> = {
  0: 6, 6: 0,   // 子↔午
  1: 7, 7: 1,   // 丑↔未
  2: 8, 8: 2,   // 寅↔申
  3: 9, 9: 3,   // 卯↔酉
  4: 10, 10: 4, // 辰↔戌
  5: 11, 11: 5, // 巳↔亥
};

// 地支六害: 子未害, 丑午害, 寅巳害, 卯辰害, 申亥害, 酉戌害
const BRANCH_HARM: Record<number, number> = {
  0: 7, 7: 0,   // 子↔未
  1: 6, 6: 1,   // 丑↔午
  2: 5, 5: 2,   // 寅↔巳
  3: 4, 4: 3,   // 卯↔辰
  8: 11, 11: 8, // 申↔亥
  9: 10, 10: 9, // 酉↔戌
};

// 地支相刑: 无礼之刑(子卯), 恃势之刑(寅巳申), 无恩之刑(丑戌未), 自刑(辰午酉亥)
const BRANCH_PUNISH: Record<number, number[]> = {
  0: [3],     // 子刑卯
  3: [0],     // 卯刑子
  2: [5],     // 寅刑巳
  5: [8],     // 巳刑申
  8: [2],     // 申刑寅
  1: [10],    // 丑刑戌
  10: [7],    // 戌刑未
  7: [1],     // 未刑丑
  4: [4],     // 辰自刑
  6: [6],     // 午自刑
  9: [9],     // 酉自刑
  11: [11],   // 亥自刑
};

// 地支三合局: 申子辰合水, 亥卯未合木, 寅午戌合火, 巳酉丑合金
const TRIPLE_COMBINE: Record<string, { branches: number[]; element: string; label: string }> = {
  "0,4,8": { branches: [0, 4, 8], element: "Water", label: "申子辰三合水局" },  // reverse order
};
// Better lookup: group by element
const TRIPLE_GROUPS = [
  { branches: [8, 0, 4], element: "Water", label: "申子辰三合水局" },
  { branches: [11, 3, 7], element: "Wood", label: "亥卯未三合木局" },
  { branches: [2, 6, 10], element: "Fire", label: "寅午戌三合火局" },
  { branches: [5, 9, 1], element: "Metal", label: "巳酉丑三合金局" },
];

/**
 * Calculate all pillar relationships for a BaZi chart.
 * Checks adjacent pillar pairs: Year-Month, Month-Day, Day-Hour.
 * Also checks triple combinations across all four branches.
 */
export function calculatePillarRelations(
  stems: number[],     // [yearStem, monthStem, dayStem, hourStem]
  branches: number[],  // [yearBranch, monthBranch, dayBranch, hourBranch]
): PillarRelation[] {
  const relations: PillarRelation[] = [];

  // Check adjacent pairs (0-1, 1-2, 2-3)
  for (let i = 0; i < 3; i++) {
    const j = i + 1;

    // Stem combine
    const sc = STEM_COMBINE[stems[i]];
    if (sc && sc.with === stems[j]) {
      relations.push({
        type: "combine",
        label: sc.label,
        labelEn: `Stem Combine: ${STEMS[stems[i]]}+${STEMS[stems[j]]} → ${sc.element}`,
        pillars: [PILLAR_NAMES[i], PILLAR_NAMES[j]],
        description: `天干${sc.label}，两柱天干相合，关系融洽和谐。`,
        fromIndex: i,
        toIndex: j,
      });
    }

    // Branch combine
    const bc = BRANCH_COMBINE[branches[i]];
    if (bc && bc.with === branches[j]) {
      relations.push({
        type: "combine",
        label: bc.label,
        labelEn: `Branch Combine: ${BRANCHES[branches[i]]}+${BRANCHES[branches[j]]} → ${bc.element}`,
        pillars: [PILLAR_NAMES[i], PILLAR_NAMES[j]],
        description: `地支${bc.label}，两柱地支相合，根基牢固，相互吸引。`,
        fromIndex: i,
        toIndex: j,
      });
    }

    // Branch clash
    const clash = BRANCH_CLASH[branches[i]];
    if (clash !== undefined && clash === branches[j]) {
      relations.push({
        type: "clash",
        label: `${BRANCHES[branches[i]]}${BRANCHES[branches[j]]}冲`,
        labelEn: `Clash: ${BRANCHES[branches[i]]} vs ${BRANCHES[branches[j]]}`,
        pillars: [PILLAR_NAMES[i], PILLAR_NAMES[j]],
        description: `地支${BRANCHES[branches[i]]}${BRANCHES[branches[j]]}相冲，变动不安，需注意此两柱所代表的层面。`,
        fromIndex: i,
        toIndex: j,
      });
    }

    // Branch harm
    const harm = BRANCH_HARM[branches[i]];
    if (harm !== undefined && harm === branches[j]) {
      relations.push({
        type: "harm",
        label: `${BRANCHES[branches[i]]}${BRANCHES[branches[j]]}害`,
        labelEn: `Harm: ${BRANCHES[branches[i]]} vs ${BRANCHES[branches[j]]}`,
        pillars: [PILLAR_NAMES[i], PILLAR_NAMES[j]],
        description: `地支${BRANCHES[branches[i]]}${BRANCHES[branches[j]]}相害，暗中破坏，防不胜防。`,
        fromIndex: i,
        toIndex: j,
      });
    }

    // Branch punish
    const punishList = BRANCH_PUNISH[branches[i]] || [];
    if (punishList.includes(branches[j])) {
      const isSelf = i === j || branches[i] === branches[j];
      relations.push({
        type: "punish",
        label: isSelf ? `${BRANCHES[branches[i]]}自刑` : `${BRANCHES[branches[i]]}${BRANCHES[branches[j]]}刑`,
        labelEn: isSelf ? `Self-Punish: ${BRANCHES[branches[i]]}` : `Punish: ${BRANCHES[branches[i]]} vs ${BRANCHES[branches[j]]}`,
        pillars: [PILLAR_NAMES[i], PILLAR_NAMES[j]],
        description: isSelf
          ? `地支${BRANCHES[branches[i]]}自刑，内心纠结，自我矛盾。`
          : `地支${BRANCHES[branches[i]]}${BRANCHES[branches[j]]}相刑，摩擦不和，需多沟通包容。`,
        fromIndex: i,
        toIndex: j,
      });
    }
  }

  // Check triple combine across all branches
  for (const group of TRIPLE_GROUPS) {
    const hasAll = group.branches.every((b) => branches.includes(b));
    if (hasAll) {
      const involvedIndices = group.branches.map((b) => branches.indexOf(b));
      relations.push({
        type: "tripleCombine",
        label: group.label,
        labelEn: `Triple Combine → ${group.element}`,
        pillars: involvedIndices.map((idx) => PILLAR_NAMES[idx]),
        description: `${group.label}，三支齐全，合力强大，${group.element}气凝聚。`,
        fromIndex: Math.min(...involvedIndices),
        toIndex: Math.max(...involvedIndices),
      });
      break; // Only report the first complete triple found
    }
  }

  return relations;
}
