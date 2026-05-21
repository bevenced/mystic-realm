// ===== 神煞 (Divine Stars / Shen Sha) =====
// Common divine stars used in BaZi analysis.
// Each star has conditions based on stem/branch combinations.

export interface ShenShaResult {
  name: string;           // Chinese name
  nameEn: string;         // English name
  type: "auspicious" | "neutral" | "sinister";
  description: string;    // Brief meaning
  locations: string[];    // Which pillar(s) they appear in
}

// The 12 Day Officers (建除十二神) based on the day branch
const DAY_OFFICERS: [string, string, string][] = [
  ["建", "Establish", "neutral"],
  ["除", "Remove", "auspicious"],
  ["满", "Full", "auspicious"],
  ["平", "Balance", "neutral"],
  ["定", "Stable", "auspicious"],
  ["执", "Execute", "neutral"],
  ["破", "Destroy", "sinister"],
  ["危", "Danger", "sinister"],
  ["成", "Accomplish", "auspicious"],
  ["收", "Receive", "auspicious"],
  ["开", "Open", "auspicious"],
  ["闭", "Close", "sinister"],
];

const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

/**
 * Calculate divine stars for a BaZi chart.
 * Returns common Shen Sha based on year and day stems/branches.
 */
export function calculateShenSha(
  yearStem: number, yearBranch: number,
  monthStem: number, monthBranch: number,
  dayStem: number, dayBranch: number,
  hourStem: number, hourBranch: number,
  gender: "male" | "female"
): ShenShaResult[] {
  const stars: ShenShaResult[] = [];
  const pillarNames = ["Year", "Month", "Day", "Hour"];
  const branchIndices = [yearBranch, monthBranch, dayBranch, hourBranch];
  const stemIndices = [yearStem, monthStem, dayStem, hourStem];

  // 1. 天乙贵人 (Heavenly Noble / Tian Yi Gui Ren)
  // Based on day stem: 甲戊→牛/羊, 乙己→子/申, 丙丁→猪/酉, 庚辛→虎/马, 壬癸→蛇/兔
  const tianYiMap: Record<number, number[]> = {
    0: [1, 7],   // 甲 → 丑(1), 未(7)
    1: [0, 8],   // 乙 → 子(0), 申(8)
    2: [11, 9],  // 丙 → 亥(11), 酉(9)
    3: [11, 9],  // 丁 → 亥(11), 酉(9)
    4: [1, 7],   // 戊 → 丑(1), 未(7)
    5: [0, 8],   // 己 → 子(0), 申(8)
    6: [2, 6],   // 庚 → 寅(2), 午(6)
    7: [2, 6],   // 辛 → 寅(2), 午(6)
    8: [4, 3],   // 壬 → 巳(4), 卯(3)
    9: [4, 3],   // 癸 → 巳(4), 卯(3)
  };

  const tianYiBranches = tianYiMap[dayStem] || [];
  const tianYiLocations: string[] = [];
  for (let i = 0; i < branchIndices.length; i++) {
    if (tianYiBranches.includes(branchIndices[i])) {
      tianYiLocations.push(pillarNames[i]);
    }
  }
  if (tianYiLocations.length > 0) {
    stars.push({
      name: "天乙贵人",
      nameEn: "Heavenly Noble",
      type: "auspicious",
      description: "Top noble star — brings help from influential people, intelligence, and grace.",
      locations: tianYiLocations,
    });
  }

  // 2. 桃花 (Peach Blossom / Tao Hua)
  // Year branch: 寅午戌→卯, 巳酉丑→午, 申子辰→酉, 亥卯未→子
  const taoHuaMap: Record<number, number> = {
    2: 3, 6: 3, 10: 3,   // 寅/午/戌 → 卯(3)
    3: 6, 7: 6, 11: 6,   // 卯/未/亥 → 午(6)
    0: 9, 4: 9, 8: 9,    // 子/辰/申 → 酉(9)
    1: 0, 5: 0, 9: 0,    // 丑/巳/酉 → 子(0)
  };

  const taoHuaBranch = taoHuaMap[yearBranch];
  const taoHuaLocations: string[] = [];
  for (let i = 0; i < branchIndices.length; i++) {
    if (branchIndices[i] === taoHuaBranch) {
      taoHuaLocations.push(pillarNames[i]);
    }
  }
  if (taoHuaLocations.length > 0) {
    stars.push({
      name: "桃花",
      nameEn: "Peach Blossom",
      type: "neutral",
      description: "Romantic charm and attractiveness. Can indicate romantic opportunities or complications.",
      locations: taoHuaLocations,
    });
  }

  // 3. 驿马 (Travel Horse / Yi Ma)
  // Year branch: 寅午戌→申, 巳酉丑→亥, 申子辰→寅, 亥卯未→巳
  const yiMaMap: Record<number, number> = {
    2: 8, 6: 8, 10: 8,    // 寅/午/戌 → 申(8)
    5: 11, 7: 11, 1: 11,  // 巳/酉/丑 → 亥(11)
    8: 2, 0: 2, 4: 2,     // 申/子/辰 → 寅(2)
    11: 5, 3: 5, 9: 5,    // 亥/卯/未 → 巳(5)
  };

  const yiMaBranch = yiMaMap[yearBranch];
  const yiMaLocations: string[] = [];
  for (let i = 0; i < branchIndices.length; i++) {
    if (branchIndices[i] === yiMaBranch) {
      yiMaLocations.push(pillarNames[i]);
    }
  }
  if (yiMaLocations.length > 0) {
    stars.push({
      name: "驿马",
      nameEn: "Travel Horse",
      type: "neutral",
      description: "Restless energy, travel, career mobility, and international opportunities.",
      locations: yiMaLocations,
    });
  }

  // 4. 华盖 (Star of Solitude / Hua Gai / Canopy)
  // Year branch: 寅午戌→戌, 巳酉丑→丑, 申子辰→辰, 亥卯未→未
  const huaGaiMap: Record<number, number> = {
    2: 10, 6: 10, 10: 10,  // 寅/午/戌 → 戌(10)
    5: 1, 7: 1, 1: 1,      // 巳/酉/丑 → 丑(1)
    8: 4, 0: 4, 4: 4,      // 申/子/辰 → 辰(4)
    11: 7, 3: 7, 9: 7,     // 亥/卯/未 → 未(7)
  };

  const huaGaiBranch = huaGaiMap[yearBranch];
  const huaGaiLocations: string[] = [];
  for (let i = 0; i < branchIndices.length; i++) {
    if (branchIndices[i] === huaGaiBranch) {
      huaGaiLocations.push(pillarNames[i]);
    }
  }
  if (huaGaiLocations.length > 0) {
    stars.push({
      name: "华盖",
      nameEn: "Canopy / Star of Solitude",
      type: "neutral",
      description: "Wisdom, spirituality, creativity, and solitude. Common among artists and scholars.",
      locations: huaGaiLocations,
    });
  }

  // 5. 劫煞 (Calamity / Jie Sha)
  // Year branch: 寅午戌→亥, 巳酉丑→寅, 申子辰→巳, 亥卯未→申
  const jieShaMap: Record<number, number> = {
    2: 11, 6: 11, 10: 11,  // 寅/午/戌 → 亥(11)
    5: 2, 7: 2, 1: 2,      // 巳/酉/丑 → 寅(2)
    8: 5, 0: 5, 4: 5,      // 申/子/辰 → 巳(5)
    11: 8, 3: 8, 9: 8,     // 亥/卯/未 → 申(8)
  };

  const jieShaBranch = jieShaMap[yearBranch];
  const jieShaLocations: string[] = [];
  for (let i = 0; i < branchIndices.length; i++) {
    if (branchIndices[i] === jieShaBranch) {
      jieShaLocations.push(pillarNames[i]);
    }
  }
  if (jieShaLocations.length > 0) {
    stars.push({
      name: "劫煞",
      nameEn: "Calamity Star",
      type: "sinister",
      description: "Challenges, obstacles, and unexpected setbacks. Builds resilience through adversity.",
      locations: jieShaLocations,
    });
  }

  // 6. 文昌 (Literary Star / Wen Chang)
  // Day stem: 甲乙→巳/午, 丙戊→申, 丁己→酉, 庚→亥, 辛→子, 壬→寅, 癸→卯
  const wenChangMap: Record<number, number[]> = {
    0: [5],     // 甲 → 巳(5)
    1: [6],     // 乙 → 午(6)
    2: [8],     // 丙 → 申(8)
    3: [9],     // 丁 → 酉(9)
    4: [8],     // 戊 → 申(8)
    5: [9],     // 己 → 酉(9)
    6: [11],    // 庚 → 亥(11)
    7: [0],     // 辛 → 子(0)
    8: [2],     // 壬 → 寅(2)
    9: [3],     // 癸 → 卯(3)
  };

  const wenChangBranches = wenChangMap[dayStem] || [];
  const wenChangLocations: string[] = [];
  for (let i = 0; i < branchIndices.length; i++) {
    if (wenChangBranches.includes(branchIndices[i])) {
      wenChangLocations.push(pillarNames[i]);
    }
  }
  if (wenChangLocations.length > 0) {
    stars.push({
      name: "文昌",
      nameEn: "Literary Star",
      type: "auspicious",
      description: "Academic excellence, writing talent, intelligence, and examination success.",
      locations: wenChangLocations,
    });
  }

  // 7. 红艳 (Red Romance / Hong Yan)
  // Day stem: 甲乙→午/申, 丙→寅, 丁→未, 戊己→辰, 庚→戌, 辛→酉, 壬→子, 癸→申
  const hongYanMap: Record<number, number[]> = {
    0: [6],     // 甲 → 午(6)
    1: [8],     // 乙 → 申(8)
    2: [2],     // 丙 → 寅(2)
    3: [7],     // 丁 → 未(7)
    4: [4],     // 戊 → 辰(4)
    5: [4],     // 己 → 辰(4)
    6: [10],    // 庚 → 戌(10)
    7: [9],     // 辛 → 酉(9)
    8: [0],     // 壬 → 子(0)
    9: [8],     // 癸 → 申(8)
  };

  const hongYanBranches = hongYanMap[dayStem] || [];
  const hongYanLocations: string[] = [];
  for (let i = 0; i < branchIndices.length; i++) {
    if (hongYanBranches.includes(branchIndices[i])) {
      hongYanLocations.push(pillarNames[i]);
    }
  }
  if (hongYanLocations.length > 0) {
    stars.push({
      name: "红艳",
      nameEn: "Red Romance",
      type: "neutral",
      description: "Passionate love life, romantic charisma, emotional intensity in relationships.",
      locations: hongYanLocations,
    });
  }

  // 8. 孤辰寡宿 (Loneliness Star / Gu Chen Gua Su)
  // Year branch: 寅卯辰→孤巳寡丑, 巳午未→孤申寡辰, 申酉戌→孤亥寡未, 亥子丑→孤寅寡戌
  const guChenMap: Record<number, number> = { 2: 5, 3: 5, 4: 5, 5: 8, 6: 8, 7: 8, 8: 11, 9: 11, 10: 11, 11: 2, 0: 2, 1: 2 };
  const guaSuMap: Record<number, number> = { 2: 1, 3: 1, 4: 1, 5: 4, 6: 4, 7: 4, 8: 7, 9: 7, 10: 7, 11: 10, 0: 10, 1: 10 };

  const guChenBranch = guChenMap[yearBranch];
  const guaSuBranch = guaSuMap[yearBranch];

  if (dayBranch === guChenBranch) {
    stars.push({
      name: "孤辰",
      nameEn: "Loneliness Star (Gu Chen)",
      type: "sinister",
      description: "Tendency toward solitude and independence. May experience late marriage or being alone.",
      locations: ["Day"],
    });
  }
  if (dayBranch === guaSuBranch) {
    stars.push({
      name: "寡宿",
      nameEn: "Widow Star (Gua Su)",
      type: "sinister",
      description: "Preference for solitude. May indicate challenges in romantic relationships.",
      locations: ["Day"],
    });
  }

  // 9. 羊刃 (Blade Star / Yang Ren)
  // Day stem: 甲→卯, 丙→午, 戊→午, 庚→酉, 壬→子
  const yangRenMap: Record<number, number> = {
    0: 3,  // 甲 → 卯(3)
    2: 6,  // 丙 → 午(6)
    4: 6,  // 戊 → 午(6)
    6: 9,  // 庚 → 酉(9)
    8: 0,  // 壬 → 子(0)
  };

  const yangRenBranch = yangRenMap[dayStem];
  if (yangRenBranch !== undefined) {
    const yangRenLocations: string[] = [];
    for (let i = 0; i < branchIndices.length; i++) {
      if (branchIndices[i] === yangRenBranch) {
        yangRenLocations.push(pillarNames[i]);
      }
    }
    if (yangRenLocations.length > 0) {
      stars.push({
        name: "羊刃",
        nameEn: "Blade Star",
        type: "neutral",
        description: "Strong will, assertiveness, competitiveness. Can indicate leadership or conflict.",
        locations: yangRenLocations,
      });
    }
  }

  return stars;
}
