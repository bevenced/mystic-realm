// ===== 纳音 (Na Yin / Five Element Tones) =====
// Na Yin associates each of the 60 Jia Zi pillar combinations
// with a specific element-tone pair. Used for deeper personality
// and destiny analysis.

export interface NaYinResult {
  stemBranch: string;        // e.g., "甲子"
  index: number;             // 0-59 in the sexagenary cycle
  element: string;           // The associated element
  elementEn: string;
  toneName: string;          // Chinese tone name
  toneNameEn: string;        // English description
}

// The 60 Jia Zi (sexagenary cycle) Na Yin associations
// Grouped in pairs of 2 as per tradition
const NAYIN_DATA: { element: string; elementEn: string; toneName: string; toneNameEn: string }[] = [
  { element: "金", elementEn: "Metal", toneName: "海中金", toneNameEn: "Metal in the Sea" },
  { element: "金", elementEn: "Metal", toneName: "炉中火", toneNameEn: "Fire in the Stove" }, // corrected
  { element: "火", elementEn: "Fire", toneName: "炉中火", toneNameEn: "Fire in the Stove" },
  { element: "火", elementEn: "Fire", toneName: "大林木", toneNameEn: "Wood in the Forest" }, // corrected
  { element: "木", elementEn: "Wood", toneName: "大林木", toneNameEn: "Wood in the Forest" },
  { element: "木", elementEn: "Wood", toneName: "路旁土", toneNameEn: "Soil by the Road" }, // corrected
  { element: "土", elementEn: "Earth", toneName: "路旁土", toneNameEn: "Soil by the Road" },
  { element: "土", elementEn: "Earth", toneName: "剑锋金", toneNameEn: "Blade Metal" },
  { element: "金", elementEn: "Metal", toneName: "剑锋金", toneNameEn: "Blade Metal" },
  { element: "金", elementEn: "Metal", toneName: "山头火", toneNameEn: "Fire on the Mountain" },
  { element: "火", elementEn: "Fire", toneName: "山头火", toneNameEn: "Fire on the Mountain" },
  { element: "火", elementEn: "Fire", toneName: "涧下水", toneNameEn: "Water in the Ravine" },
  { element: "水", elementEn: "Water", toneName: "涧下水", toneNameEn: "Water in the Ravine" },
  { element: "水", elementEn: "Water", toneName: "城头土", toneNameEn: "Earth on the Wall" },
  { element: "土", elementEn: "Earth", toneName: "城头土", toneNameEn: "Earth on the Wall" },
  { element: "土", elementEn: "Earth", toneName: "白蜡金", toneNameEn: "Wax Metal" },
  { element: "金", elementEn: "Metal", toneName: "白蜡金", toneNameEn: "Wax Metal" },
  { element: "金", elementEn: "Metal", toneName: "杨柳木", toneNameEn: "Willow Wood" },
  { element: "木", elementEn: "Wood", toneName: "杨柳木", toneNameEn: "Willow Wood" },
  { element: "木", elementEn: "Wood", toneName: "泉中水", toneNameEn: "Water in the Spring" },
  { element: "水", elementEn: "Water", toneName: "泉中水", toneNameEn: "Water in the Spring" },
  { element: "水", elementEn: "Water", toneName: "屋上土", toneNameEn: "Earth on the Roof" },
  { element: "土", elementEn: "Earth", toneName: "屋上土", toneNameEn: "Earth on the Roof" },
  { element: "土", elementEn: "Earth", toneName: "霹雳火", toneNameEn: "Thunder Fire" },
  { element: "火", elementEn: "Fire", toneName: "霹雳火", toneNameEn: "Thunder Fire" },
  { element: "火", elementEn: "Fire", toneName: "松柏木", toneNameEn: "Pine Wood" },
  { element: "木", elementEn: "Wood", toneName: "松柏木", toneNameEn: "Pine Wood" },
  { element: "木", elementEn: "Wood", toneName: "长流水", toneNameEn: "Flowing Water" },
  { element: "水", elementEn: "Water", toneName: "长流水", toneNameEn: "Flowing Water" },
  { element: "水", elementEn: "Water", toneName: "砂石金", toneNameEn: "Gravel Metal" },
  { element: "金", elementEn: "Metal", toneName: "砂石金", toneNameEn: "Gravel Metal" },
  { element: "金", elementEn: "Metal", toneName: "山下火", toneNameEn: "Fire at the Foot of Mountain" },
  { element: "火", elementEn: "Fire", toneName: "山下火", toneNameEn: "Fire at the Foot of Mountain" },
  { element: "火", elementEn: "Fire", toneName: "平地木", toneNameEn: "Wood on the Plain" },
  { element: "木", elementEn: "Wood", toneName: "平地木", toneNameEn: "Wood on the Plain" },
  { element: "木", elementEn: "Wood", toneName: "壁上土", toneNameEn: "Earth on the Wall" },
  { element: "土", elementEn: "Earth", toneName: "壁上土", toneNameEn: "Earth on the Wall" },
  { element: "土", elementEn: "Earth", toneName: "金箔金", toneNameEn: "Gold Foil" },
  { element: "金", elementEn: "Metal", toneName: "金箔金", toneNameEn: "Gold Foil" },
  { element: "金", elementEn: "Metal", toneName: "覆灯火", toneNameEn: "Lamp Fire" },
  { element: "火", elementEn: "Fire", toneName: "覆灯火", toneNameEn: "Lamp Fire" },
  { element: "火", elementEn: "Fire", toneName: "天河水", toneNameEn: "Water in the Sky" },
  { element: "水", elementEn: "Water", toneName: "天河水", toneNameEn: "Water in the Sky" },
  { element: "水", elementEn: "Water", toneName: "大驿土", toneNameEn: "Earth in the Post Road" },
  { element: "土", elementEn: "Earth", toneName: "大驿土", toneNameEn: "Earth in the Post Road" },
  { element: "土", elementEn: "Earth", toneName: "钗钏金", toneNameEn: "Fine Gold" },
  { element: "金", elementEn: "Metal", toneName: "钗钏金", toneNameEn: "Fine Gold" },
  { element: "金", elementEn: "Metal", toneName: "桑柘木", toneNameEn: "Mulberry Wood" },
  { element: "木", elementEn: "Wood", toneName: "桑柘木", toneNameEn: "Mulberry Wood" },
  { element: "木", elementEn: "Wood", toneName: "大溪水", toneNameEn: "Water in the Stream" },
  { element: "水", elementEn: "Water", toneName: "大溪水", toneNameEn: "Water in the Stream" },
  { element: "水", elementEn: "Water", toneName: "沙中土", toneNameEn: "Earth in the Sand" },
  { element: "土", elementEn: "Earth", toneName: "沙中土", toneNameEn: "Earth in the Sand" },
  { element: "土", elementEn: "Earth", toneName: "天上火", toneNameEn: "Fire in the Sky" },
  { element: "火", elementEn: "Fire", toneName: "天上火", toneNameEn: "Fire in the Sky" },
  { element: "火", elementEn: "Fire", toneName: "石榴木", toneNameEn: "Pomegranate Wood" },
  { element: "木", elementEn: "Wood", toneName: "石榴木", toneNameEn: "Pomegranate Wood" },
  { element: "木", elementEn: "Wood", toneName: "大海水", toneNameEn: "Water in the Ocean" },
  { element: "水", elementEn: "Water", toneName: "大海水", toneNameEn: "Water in the Ocean" },
  { element: "水", elementEn: "Water", toneName: "海中金", toneNameEn: "Metal in the Sea" },
];

const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

/**
 * Get the sexagenary cycle index for a stem-branch pair.
 */
export function getSexagenaryIndex(stemIndex: number, branchIndex: number): number {
  // In the 60-year cycle, index = (stemIndex - branchIndex % 10 + 10) % 10 * 6 + branchIndex
  // Simpler: find the 60-cycle index
  let idx = stemIndex - branchIndex;
  if (idx < 0) idx += 10;
  idx = (idx * 6 + branchIndex) % 60;
  return idx;
}

/**
 * Get Na Yin for a pillar by stem and branch indices.
 */
export function getNaYin(stemIndex: number, branchIndex: number): NaYinResult {
  const sexagenaryIdx = getSexagenaryIndex(stemIndex, branchIndex);
  const dataIdx = Math.floor(sexagenaryIdx / 2);
  const data = NAYIN_DATA[dataIdx];

  return {
    stemBranch: STEMS[stemIndex] + BRANCHES[branchIndex],
    index: sexagenaryIdx,
    element: data.element,
    elementEn: data.elementEn,
    toneName: data.toneName,
    toneNameEn: data.toneNameEn,
  };
}
