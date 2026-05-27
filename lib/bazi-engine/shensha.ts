// ===== 神煞 (Divine Stars / Shen Sha) =====
// Comprehensive divine stars used in BaZi analysis.
// Each star has conditions based on stem/branch combinations.

export interface ShenShaResult {
  name: string;
  nameEn: string;
  type: "auspicious" | "neutral" | "sinister";
  description: string;
  locations: string[];
  category?: string;
}

// Category labels for grouping stars in the UI
export function getShenshaCategory(name: string): string {
  const map: Record<string, string> = {
    "天乙贵人": "贵人", "天德贵人": "贵人", "月德贵人": "贵人", "太极贵人": "贵人", "福星贵人": "贵人",
    "文昌": "才华", "学堂": "才华", "词馆": "才华", "华盖": "才华",
    "禄神": "财运", "金舆": "财运",
    "桃花": "桃花", "红艳": "桃花",
    "将星": "权威", "魁罡": "权威", "羊刃": "权威",
    "驿马": "变动",
    "孤辰": "孤寡", "寡宿": "孤寡",
    "劫煞": "凶煞", "十恶大败": "凶煞",
    "空亡": "空亡",
  };
  return map[name] || "其他";
}

const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const pillarNames = ["Year", "Month", "Day", "Hour"];

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
  const branchIndices = [yearBranch, monthBranch, dayBranch, hourBranch];
  const stemIndices = [yearStem, monthStem, dayStem, hourStem];

  function findLocations(branches: number[]): string[] {
    const locs: string[] = [];
    for (let i = 0; i < branchIndices.length; i++) {
      if (branches.includes(branchIndices[i])) locs.push(pillarNames[i]);
    }
    return locs;
  }

  // 1. 天乙贵人 (Heavenly Noble)
  const tianYiMap: Record<number, number[]> = {
    0: [1, 7], 1: [0, 8], 2: [11, 9], 3: [11, 9], 4: [1, 7],
    5: [0, 8], 6: [2, 6], 7: [2, 6], 8: [4, 3], 9: [4, 3],
  };
  const tianYiLoc = findLocations(tianYiMap[dayStem] || []);
  if (tianYiLoc.length) stars.push({ name: "天乙贵人", nameEn: "Heavenly Noble", type: "auspicious", description: "最尊贵之神，逢凶化吉，得贵人相助，聪明智慧。", locations: tianYiLoc, category: "贵人" });

  // 2. 天德贵人 (Heavenly Virtue Noble) — based on month branch
  const tianDeMap: Record<number, number> = {
    0: 5, 1: 6, 2: 10, 3: 8, 4: 10, 5: 8, 6: 5, 7: 6, 8: 2, 9: 11, 10: 0, 11: 1,
  };
  const tianDeBranch = tianDeMap[monthBranch];
  if (tianDeBranch !== undefined) {
    const locs = findLocations([tianDeBranch]);
    if (locs.length) stars.push({ name: "天德贵人", nameEn: "Heavenly Virtue Noble", type: "auspicious", description: "天德为福德之神，能解一切凶厄，主心地善良、福泽深厚。", locations: locs, category: "贵人" });
  }

  // 3. 月德贵人 (Monthly Virtue Noble) — based on month branch
  const yueDeMap: Record<number, number[]> = {
    0: [7], 1: [6], 2: [2], 3: [10], 4: [7], 5: [6], 6: [2], 7: [10], 8: [4], 9: [3], 10: [4], 11: [3],
  };
  const yueDeBranches = yueDeMap[monthBranch] || [];
  const yueDeLoc = findLocations(yueDeBranches);
  if (yueDeLoc.length) stars.push({ name: "月德贵人", nameEn: "Monthly Virtue Noble", type: "auspicious", description: "月德乃太阴之德，主福寿安康，女命得之尤为吉祥。", locations: yueDeLoc, category: "贵人" });

  // 4. 太极贵人 (Tai Chi Noble) — based on year stem + day stem
  const taiChiMap: Record<number, number[]> = {
    0: [0, 6], 1: [0, 6], 2: [3, 9], 3: [3, 9],
    4: [4, 7, 10, 1], 5: [4, 7, 10, 1],
    6: [2, 6], 7: [2, 6], 8: [3, 3], 9: [3, 3],
  };
  const taiChiYear = taiChiMap[yearStem] || [];
  const taiChiDay = taiChiMap[dayStem] || [];
  const taiChiAll = [...new Set([...taiChiYear, ...taiChiDay])];
  const taiChiLoc = findLocations(taiChiAll);
  if (taiChiLoc.length) stars.push({ name: "太极贵人", nameEn: "Tai Chi Noble", type: "auspicious", description: "太极主智慧超群，有玄学天分，好学深思，悟性极高。", locations: taiChiLoc, category: "贵人" });

  // 5. 福星贵人 (Fortune Star) — based on day stem
  const fuXingMap: Record<number, number[]> = {
    0: [1, 7], 1: [4, 10], 2: [0, 6], 3: [3, 9], 4: [5, 11],
    5: [8, 2], 6: [3, 9], 7: [4, 10], 8: [4, 10], 9: [3, 9],
  };
  const fuXingLoc = findLocations(fuXingMap[dayStem] || []);
  if (fuXingLoc.length) stars.push({ name: "福星贵人", nameEn: "Fortune Star Noble", type: "auspicious", description: "福星主一生衣食无忧，福禄双全，平安顺遂。", locations: fuXingLoc, category: "贵人" });

  // 6. 文昌 (Literary Star)
  const wenChangMap: Record<number, number[]> = {
    0: [5], 1: [6], 2: [8], 3: [9], 4: [8], 5: [9], 6: [11], 7: [0], 8: [2], 9: [3],
  };
  const wenChangLoc = findLocations(wenChangMap[dayStem] || []);
  if (wenChangLoc.length) stars.push({ name: "文昌", nameEn: "Literary Star", type: "auspicious", description: "文昌入命，文采出众，考试运佳，学术有成。", locations: wenChangLoc, category: "才华" });

  // 7. 学堂 (School Star) — based on day stem
  const xueTangMap: Record<number, number[]> = {
    0: [11], 1: [6], 2: [2], 3: [10], 4: [2], 5: [8], 6: [5], 7: [0], 8: [8], 9: [3],
  };
  const xueTangLoc = findLocations(xueTangMap[dayStem] || []);
  if (xueTangLoc.length) stars.push({ name: "学堂", nameEn: "School Star", type: "auspicious", description: "学堂星主学业有成，博学多才，一生好学不倦。", locations: xueTangLoc, category: "才华" });

  // 8. 词馆 (Literature Star) — based on day stem (opposite of 学堂)
  const ciGuanMap: Record<number, number[]> = {
    0: [6], 1: [11], 2: [10], 3: [2], 4: [8], 5: [5], 6: [0], 7: [5], 8: [3], 9: [8],
  };
  const ciGuanLoc = findLocations(ciGuanMap[dayStem] || []);
  if (ciGuanLoc.length) stars.push({ name: "词馆", nameEn: "Literature Star", type: "auspicious", description: "词馆主文采飞扬，口才出众，擅长表达与写作。", locations: ciGuanLoc, category: "才华" });

  // 9. 华盖 (Canopy / Star of Solitude)
  const huaGaiMap: Record<number, number> = {
    2: 10, 6: 10, 10: 10, 5: 1, 7: 1, 1: 1, 8: 4, 0: 4, 4: 4, 11: 7, 3: 7, 9: 7,
  };
  const huaGaiBranch = huaGaiMap[yearBranch];
  const huaGaiLoc = findLocations([huaGaiBranch]);
  if (huaGaiLoc.length) stars.push({ name: "华盖", nameEn: "Canopy Star", type: "neutral", description: "华盖入命，聪明有才艺，但性情孤高，宜艺术、玄学、修行。", locations: huaGaiLoc, category: "才华" });

  // 10. 禄神 (Lu Shen / Salary Star) — based on day stem
  const luShenMap: Record<number, number> = {
    0: 2, 1: 3, 2: 5, 3: 6, 4: 5, 5: 6, 6: 8, 7: 9, 8: 11, 9: 0,
  };
  const luShenBranch = luShenMap[dayStem];
  if (luShenBranch !== undefined) {
    const locs = findLocations([luShenBranch]);
    if (locs.length) stars.push({ name: "禄神", nameEn: "Salary Star", type: "auspicious", description: "禄神为养命之源，主财运亨通，衣食丰足，事业有成。", locations: locs, category: "财运" });
  }

  // 11. 金舆 (Golden Chariot) — based on year branch + day branch
  const jinYuMap: Record<number, number[]> = {
    0: [4], 1: [8], 2: [0], 3: [11], 4: [2], 5: [11], 6: [1], 7: [7], 8: [4], 9: [8], 10: [0], 11: [5],
  };
  const jinYuYearBranches = jinYuMap[yearBranch] || [];
  const jinYuDayBranches = jinYuMap[dayBranch] || [];
  const jinYuAll = [...new Set([...jinYuYearBranches, ...jinYuDayBranches])];
  const jinYuLoc = findLocations(jinYuAll);
  if (jinYuLoc.length) stars.push({ name: "金舆", nameEn: "Golden Chariot", type: "auspicious", description: "金舆为财富之星，主富贵荣华，车马盈门，财源广进。", locations: jinYuLoc, category: "财运" });

  // 12. 桃花 (Peach Blossom)
  const taoHuaMap: Record<number, number> = {
    2: 3, 6: 3, 10: 3, 3: 6, 7: 6, 11: 6, 0: 9, 4: 9, 8: 9, 1: 0, 5: 0, 9: 0,
  };
  const taoHuaBranch = taoHuaMap[yearBranch];
  const taoHuaLoc = findLocations([taoHuaBranch]);
  if (taoHuaLoc.length) stars.push({ name: "桃花", nameEn: "Peach Blossom", type: "neutral", description: "桃花入命，容貌秀丽，人缘好，异性缘佳。宜戒烂桃花。", locations: taoHuaLoc, category: "桃花" });

  // 13. 红艳 (Red Romance)
  const hongYanMap: Record<number, number[]> = {
    0: [6], 1: [8], 2: [2], 3: [7], 4: [4], 5: [4], 6: [10], 7: [9], 8: [0], 9: [8],
  };
  const hongYanLoc = findLocations(hongYanMap[dayStem] || []);
  if (hongYanLoc.length) stars.push({ name: "红艳", nameEn: "Red Romance", type: "neutral", description: "红艳主感情丰富，多情浪漫，异性缘旺，亦防感情纠葛。", locations: hongYanLoc, category: "桃花" });

  // 14. 驿马 (Travel Horse)
  const yiMaMap: Record<number, number> = {
    2: 8, 6: 8, 10: 8, 5: 11, 7: 11, 1: 11, 8: 2, 0: 2, 4: 2, 11: 5, 3: 5, 9: 5,
  };
  const yiMaBranch = yiMaMap[yearBranch];
  const yiMaLoc = findLocations([yiMaBranch]);
  if (yiMaLoc.length) stars.push({ name: "驿马", nameEn: "Travel Horse", type: "neutral", description: "驿马主奔波走动，宜外出发展、经商贸易。动中求财。", locations: yiMaLoc, category: "变动" });

  // 15. 将星 (General Star) — based on year branch
  const jiangXingMap: Record<number, number> = {
    0: 0, 1: 9, 2: 6, 3: 6, 4: 4, 5: 4, 6: 6, 7: 3, 8: 0, 9: 9, 10: 4, 11: 3,
  };
  const jiangXingBranch = jiangXingMap[yearBranch];
  const jiangXingLoc = findLocations([jiangXingBranch]);
  if (jiangXingLoc.length) stars.push({ name: "将星", nameEn: "General Star", type: "auspicious", description: "将星入命，有领导才能，果敢决断，宜从政军警或管理层。", locations: jiangXingLoc, category: "权威" });

  // 16. 魁罡 (Kui Gang) — specific day pillars
  const kuiGangPairs = [[6,4],[8,4],[4,10],[6,10]]; // 庚辰/壬辰/戊戌/庚戌
  const isKuiGang = kuiGangPairs.some(([s,b]) => s === dayStem && b === dayBranch);
  if (isKuiGang) stars.push({ name: "魁罡", nameEn: "Kui Gang Star", type: "neutral", description: "魁罡入命，性格刚烈强势，聪明果断，宜执法、军警、管理。不可破，破则多厄。", locations: ["Day"], category: "权威" });

  // 17. 羊刃 (Blade Star)
  const yangRenMap: Record<number, number> = { 0: 3, 2: 6, 4: 6, 6: 9, 8: 0 };
  const yangRenBranch = yangRenMap[dayStem];
  if (yangRenBranch !== undefined) {
    const yangRenLoc = findLocations([yangRenBranch]);
    if (yangRenLoc.length) stars.push({ name: "羊刃", nameEn: "Blade Star", type: "neutral", description: "羊刃主性格刚烈，有魄力。宜武职，但防冲动惹祸与意外伤害。", locations: yangRenLoc, category: "权威" });
  }

  // 18. 劫煞 (Calamity Star)
  const jieShaMap: Record<number, number> = {
    2: 11, 6: 11, 10: 11, 5: 2, 7: 2, 1: 2, 8: 5, 0: 5, 4: 5, 11: 8, 3: 8, 9: 8,
  };
  const jieShaBranch = jieShaMap[yearBranch];
  const jieShaLoc = findLocations([jieShaBranch]);
  if (jieShaLoc.length) stars.push({ name: "劫煞", nameEn: "Calamity Star", type: "sinister", description: "劫煞主意外灾祸、失财、是非口舌。宜小心行事，多行善积德化解。", locations: jieShaLoc, category: "凶煞" });

  // 19. 孤辰寡宿 (Loneliness Stars)
  const guChenMap: Record<number, number> = { 2: 5, 3: 5, 4: 5, 5: 8, 6: 8, 7: 8, 8: 11, 9: 11, 10: 11, 11: 2, 0: 2, 1: 2 };
  const guaSuMap: Record<number, number> = { 2: 1, 3: 1, 4: 1, 5: 4, 6: 4, 7: 4, 8: 7, 9: 7, 10: 7, 11: 10, 0: 10, 1: 10 };
  if (dayBranch === guChenMap[yearBranch]) stars.push({ name: "孤辰", nameEn: "Loneliness Star", type: "sinister", description: "孤辰入命，性格孤僻独立，婚姻易晚或不顺。宜培养社交。", locations: ["Day"], category: "孤寡" });
  if (dayBranch === guaSuMap[yearBranch]) stars.push({ name: "寡宿", nameEn: "Widow Star", type: "sinister", description: "寡宿主感情淡薄，有孤独倾向。宜晚婚或修身养性化解。", locations: ["Day"], category: "孤寡" });

  // 20. 十恶大败 (Ten Evils Defeat) — specific day pillars
  const shiEDaBai = [
    [0,4],[1,5],[2,6],[3,7],[4,8],[5,9],[6,10],[7,11],[8,0],[9,1]
  ];
  const isShiEBai = shiEDaBai.some(([s,b]) => s === dayStem && b === dayBranch);
  if (isShiEBai) stars.push({ name: "十恶大败", nameEn: "Ten Evils Defeat", type: "sinister", description: "十恶大败日，主钱财易散，不善理财。宜以德化之，多行布施。", locations: ["Day"], category: "凶煞" });

  return stars;
}

/** Calculate Kong Wang (Emptiness) for a stem-branch pair */
export function getKongWang(stemIndex: number, branchIndex: number): string {
  const j = stemIndex + 10 * (((stemIndex - branchIndex) / 2 + 6) % 6);
  const xun = Math.floor(j / 10);
  return BRANCHES[(12 - 2 * xun) % 12] + BRANCHES[(13 - 2 * xun) % 12];
}

/** Get Kong Wang for all four pillars */
export function getAllKongWang(
  stems: number[], branches: number[]
): string[] {
  return stems.map((s, i) => getKongWang(s, branches[i]));
}
