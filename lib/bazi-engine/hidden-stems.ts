// ===== 藏干 (Hidden Stems / Cang Gan) =====
// Each Earthly Branch contains 1-3 hidden Heavenly Stems.
// Primary (主气), Secondary (中气), Tertiary (余气)
// Index 0-11 = 子丑寅卯辰巳午未申酉戌亥

export interface HiddenStem {
  stem: string;       // Chinese character
  stemIndex: number;  // 0-9 index in HEAVENLY_STEMS
  qi: "primary" | "secondary" | "tertiary";
  element: string;    // Wood, Fire, Earth, Metal, Water
}

const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const STEM_ELEMENTS = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];

// Hidden stems for each branch [0=子 ... 11=亥]
const HIDDEN_STEMS_DATA: HiddenStem[][] = [
  // 子 (Zi) — 癸
  [{ stem: "癸", stemIndex: 9, qi: "primary", element: "Water" }],
  // 丑 (Chou) — 己, 癸, 辛
  [
    { stem: "己", stemIndex: 5, qi: "primary", element: "Earth" },
    { stem: "癸", stemIndex: 9, qi: "secondary", element: "Water" },
    { stem: "辛", stemIndex: 7, qi: "tertiary", element: "Metal" },
  ],
  // 寅 (Yin) — 甲, 丙, 戊
  [
    { stem: "甲", stemIndex: 0, qi: "primary", element: "Wood" },
    { stem: "丙", stemIndex: 2, qi: "secondary", element: "Fire" },
    { stem: "戊", stemIndex: 4, qi: "tertiary", element: "Earth" },
  ],
  // 卯 (Mao) — 乙
  [{ stem: "乙", stemIndex: 1, qi: "primary", element: "Wood" }],
  // 辰 (Chen) — 戊, 乙, 癸
  [
    { stem: "戊", stemIndex: 4, qi: "primary", element: "Earth" },
    { stem: "乙", stemIndex: 1, qi: "secondary", element: "Wood" },
    { stem: "癸", stemIndex: 9, qi: "tertiary", element: "Water" },
  ],
  // 巳 (Si) — 丙, 庚, 戊
  [
    { stem: "丙", stemIndex: 2, qi: "primary", element: "Fire" },
    { stem: "庚", stemIndex: 6, qi: "secondary", element: "Metal" },
    { stem: "戊", stemIndex: 4, qi: "tertiary", element: "Earth" },
  ],
  // 午 (Wu) — 丁, 己
  [
    { stem: "丁", stemIndex: 3, qi: "primary", element: "Fire" },
    { stem: "己", stemIndex: 5, qi: "secondary", element: "Earth" },
  ],
  // 未 (Wei) — 己, 丁, 乙
  [
    { stem: "己", stemIndex: 5, qi: "primary", element: "Earth" },
    { stem: "丁", stemIndex: 3, qi: "secondary", element: "Fire" },
    { stem: "乙", stemIndex: 1, qi: "tertiary", element: "Wood" },
  ],
  // 申 (Shen) — 庚, 壬, 戊
  [
    { stem: "庚", stemIndex: 6, qi: "primary", element: "Metal" },
    { stem: "壬", stemIndex: 8, qi: "secondary", element: "Water" },
    { stem: "戊", stemIndex: 4, qi: "tertiary", element: "Earth" },
  ],
  // 酉 (You) — 辛
  [{ stem: "辛", stemIndex: 7, qi: "primary", element: "Metal" }],
  // 戌 (Xu) — 戊, 辛, 丁
  [
    { stem: "戊", stemIndex: 4, qi: "primary", element: "Earth" },
    { stem: "辛", stemIndex: 7, qi: "secondary", element: "Metal" },
    { stem: "丁", stemIndex: 3, qi: "tertiary", element: "Fire" },
  ],
  // 亥 (Hai) — 壬, 甲
  [
    { stem: "壬", stemIndex: 8, qi: "primary", element: "Water" },
    { stem: "甲", stemIndex: 0, qi: "secondary", element: "Wood" },
  ],
];

/**
 * Get hidden stems for an Earthly Branch by its index.
 * @param branchIndex 0=子 ... 11=亥
 */
export function getHiddenStems(branchIndex: number): HiddenStem[] {
  if (branchIndex < 0 || branchIndex > 11) return [];
  return HIDDEN_STEMS_DATA[branchIndex];
}

/**
 * Get hidden stem element counts for a branch.
 * Returns weighted counts (primary=3, secondary=2, tertiary=1).
 */
export function getHiddenStemElementWeights(branchIndex: number): Record<string, number> {
  const weights: Record<string, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  const hidden = getHiddenStems(branchIndex);
  for (const h of hidden) {
    const w = h.qi === "primary" ? 3 : h.qi === "secondary" ? 2 : 1;
    weights[h.element] += w;
  }
  return weights;
}

/**
 * Get all hidden stems (with their elements) for all four branches.
 */
export function getAllHiddenStems(branchIndices: number[]): {
  branchIndex: number;
  stems: HiddenStem[];
  elementWeights: Record<string, number>;
}[] {
  return branchIndices.map((bi) => ({
    branchIndex: bi,
    stems: getHiddenStems(bi),
    elementWeights: getHiddenStemElementWeights(bi),
  }));
}
