// ===== 十二长生 (Twelve Fortune Stages) =====
// Maps each branch to a fortune stage based on the day stem.

const TWELVE_FORTUNE = ["长生","沐浴","冠带","临官","帝旺","衰","病","死","墓","绝","胎","养"];

export const FORTUNE_STAGE_INFO: Record<string, { en: string; desc: string; quality: "auspicious" | "neutral" | "sinister" }> = {
  "长生": { en: "Growth",       desc: "如人之初生，充满希望与成长力。万物生发，前程似锦。", quality: "auspicious" },
  "沐浴": { en: "Bath",         desc: "如婴儿洗浴，虽有洁净之意，却脆弱易损。桃花之始。", quality: "neutral" },
  "冠带": { en: "Adolescence",  desc: "如少年加冠，逐渐成熟，开始承担责任与使命。", quality: "auspicious" },
  "临官": { en: "Authority",    desc: "如人入仕途，掌握权力，事业有成，意气风发。", quality: "auspicious" },
  "帝旺": { en: "Peak",         desc: "如人生巅峰，精力旺盛到极点，物极必反当戒骄戒躁。", quality: "auspicious" },
  "衰":   { en: "Decline",      desc: "盛极而衰，气力渐退。宜守不宜攻，稳中求进。", quality: "neutral" },
  "病":   { en: "Sickness",     desc: "衰后继病，运势低迷。宜养精蓄锐，等待时机。", quality: "sinister" },
  "死":   { en: "Death",        desc: "气数将尽，旧事已了。置之死地而后生，转机将至。", quality: "sinister" },
  "墓":   { en: "Burial",       desc: "入墓收藏，敛藏待时。如种子深埋，蓄力待发。", quality: "neutral" },
  "绝":   { en: "Exhaustion",   desc: "气数已绝，看似无望。然绝处逢生，新循环将启。", quality: "sinister" },
  "胎":   { en: "Conception",   desc: "如婴在腹，新生之始。暗中酝酿，未来可期。", quality: "neutral" },
  "养":   { en: "Nurture",      desc: "胎后养育，积蓄能量。循序渐进，根基渐固。", quality: "auspicious" },
};

// Yang stems' starting branch for 长生 (indexed by dayStemIndex)
// Only even indices (Yang): 甲0, 丙2, 戊4, 庚6, 壬8
const YANG_START: Record<number, number> = {
  0: 11, // 甲(木) → 亥
  2: 2,  // 丙(火) → 寅
  4: 2,  // 戊(土) → 寅 (火土同宫)
  6: 5,  // 庚(金) → 巳
  8: 8,  // 壬(水) → 申
};

/**
 * 获取指定天干在地支上的十二长生位置
 */
export function getFortuneStage(dayStemIndex: number, branchIndex: number): string {
  if (dayStemIndex % 2 === 0) {
    const start = YANG_START[dayStemIndex];
    const stage = (branchIndex - start + 12) % 12;
    return TWELVE_FORTUNE[stage];
  } else {
    const yangStart = YANG_START[dayStemIndex - 1];
    const yinStart = (yangStart + 7) % 12;
    const stage = (yinStart - branchIndex + 12) % 12;
    return TWELVE_FORTUNE[stage];
  }
}

/**
 * 获取四柱所有地支的十二长生
 */
export function getAllFortuneStages(dayStemIndex: number, branchIndices: number[]): string[] {
  return branchIndices.map((bi) => getFortuneStage(dayStemIndex, bi));
}
