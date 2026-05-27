// ===== 调候用神 (Climate Adjustment / Tiao Hou Yong Shen) =====
// Based on the classic Qiong Tong Bao Jian (穷通宝鉴).
// For each day stem × month branch, lists the needed heavenly stems
// to adjust the seasonal "climate" of the chart.

export interface TiaoHouResult {
  /** The stems recommended for climate adjustment (Chinese chars) */
  stems: string[];
  /** Element(s) of the recommended stems */
  elements: string[];
  /** Brief explanation of why these are needed */
  reason: string;
}

const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const STEM_ELEMENTS = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];

// TiaoHou table: [dayStemIndex][monthBranchIndex] → { stems: number[], reason: string }
// monthBranchIndex: 0=子(11月), 1=丑(12月), 2=寅(1月), 3=卯(2月), 4=辰(3月), 5=巳(4月),
//                    6=午(5月), 7=未(6月), 8=申(7月), 9=酉(8月), 10=戌(9月), 11=亥(10月)

type MonthEntry = { stems: number[]; reason: string };

const TIAOHOU_TABLE: Record<number, MonthEntry[]> = {
  // 甲 Wood Yang (index 0)
  0: [
    { stems: [6], reason: "子月寒冬，木性枯寒，需庚金劈甲引丁火暖局。" },           // 子
    { stems: [6, 2], reason: "丑月湿寒，庚金劈甲，丙火解冻，丁火为辅。" },         // 丑
    { stems: [2, 9], reason: "寅月初春余寒，丙火暖局，癸水润木，水火既济。" },     // 寅
    { stems: [6, 2], reason: "卯月木气旺盛，庚金修剪，丙火泄秀，庚丙为用。" },     // 卯
    { stems: [6, 1], reason: "辰月木气渐老，庚金雕琢成器，乙木柔顺为辅。" },       // 辰
    { stems: [9, 6], reason: "巳月火旺木焚，癸水降温为先，庚金生水为辅。" },       // 巳
    { stems: [9, 6], reason: "午月烈火炎炎，癸水为急，庚金发水源，无水则枯。" },   // 午
    { stems: [9, 1], reason: "未月土燥木枯，癸水润局，乙木柔顺为辅。" },           // 未
    { stems: [6, 1], reason: "申月金气当令，庚金雕木成器，乙木调和。" },           // 申
    { stems: [6, 1], reason: "酉月金旺木凋，庚金修剪，乙木柔顺，庚乙配合。" },     // 酉
    { stems: [6, 3], reason: "戌月土燥，庚金劈木，丁火炼金，庚丁并用。" },         // 戌
    { stems: [6, 1], reason: "亥月水旺木浮，庚金制水，乙木帮身，庚乙为用。" },     // 亥
  ],
  // 乙 Wood Yin (index 1)
  1: [
    { stems: [2], reason: "子月水冷木寒，丙火暖局解冻为第一要务。" },               // 子
    { stems: [2], reason: "丑月湿寒，丙火暖局，向阳花木方能生长。" },               // 丑
    { stems: [2, 9], reason: "寅月春寒，丙火暖木，癸水润根，水火调候。" },         // 寅
    { stems: [2, 9], reason: "卯月花木繁盛，丙火泄秀，癸水润根，丙癸相济。" },     // 卯
    { stems: [9, 2], reason: "辰月土重，癸水润局为先，丙火暖木为辅。" },           // 辰
    { stems: [9], reason: "巳月火旺木焦，癸水为急，无癸则花木枯萎。" },           // 巳
    { stems: [9, 2], reason: "午月炎夏，癸水解炎为主，丙火为辅调候。" },           // 午
    { stems: [9, 2], reason: "未月土燥木枯，癸水润局，丙火暖木，各有其用。" },     // 未
    { stems: [2, 9], reason: "申月金旺，丙火制金护木，癸水润局，丙癸并重。" },     // 申
    { stems: [9, 2], reason: "酉月金锐，癸水泄金生木，丙火暖局制金。" },           // 酉
    { stems: [9, 2], reason: "戌月燥土，癸水为先，丙火次之，润木暖根。" },         // 戌
    { stems: [2], reason: "亥月水寒，丙火暖局，藤萝系甲，可春可秋。" },             // 亥
  ],
  // 丙 Fire Yang (index 2)
  2: [
    { stems: [8, 4], reason: "子月火死，壬水为尊，戊土制水护火，水火既济。" },     // 子
    { stems: [8, 5], reason: "丑月湿寒，壬水映辉，己土制水，壬己配合。" },         // 丑
    { stems: [8, 6], reason: "寅月春阳渐暖，壬水为用，庚金生水，水火相济。" },     // 寅
    { stems: [8, 5], reason: "卯月阳气上升，壬水映日，己土制水护火。" },           // 卯
    { stems: [8, 0], reason: "辰月土重晦火，壬水反光，甲木疏土通火。" },           // 辰
    { stems: [8, 6], reason: "巳月火炎土燥，壬水解炎，庚金发水源，水为急务。" },   // 巳
    { stems: [8, 6], reason: "午月烈火熊熊，壬水为第一用神，庚金生水为佐。" },     // 午
    { stems: [8, 6], reason: "未月火退气，壬水调候，庚金生水，金水并用。" },       // 未
    { stems: [8, 4], reason: "申月金生水旺，壬水为用，戊土制水不使泛滥。" },       // 申
    { stems: [8, 4], reason: "酉月金旺水相，壬水调候，戊土护火。" },               // 酉
    { stems: [0, 8], reason: "戌月火库，甲木疏土生火，壬水调候，甲壬共济。" },     // 戌
    { stems: [4, 8], reason: "亥月水旺火绝，戊土制水为先，壬甲次之，木火通明。" }, // 亥
  ],
  // 丁 Fire Yin (index 3)
  3: [
    { stems: [0, 6], reason: "子月灯火微弱，甲木生火为先，庚金劈甲引丁为用。" },   // 子
    { stems: [0, 6], reason: "丑月寒夜，甲木为灯芯，庚金劈甲，甲庚并重。" },       // 丑
    { stems: [0, 6], reason: "寅月春风送暖，甲木生火，庚金劈甲，木火通明。" },     // 寅
    { stems: [0, 6], reason: "卯月春深木旺，甲庚并用，以庚劈甲引丁火之光。" },     // 卯
    { stems: [0, 6], reason: "辰月土重晦火，甲木疏土为先，庚金劈甲为辅。" },       // 辰
    { stems: [0, 6], reason: "巳月丙火当旺，甲木生丁，庚金劈甲取丁，甲庚均重。" }, // 巳
    { stems: [8, 6], reason: "午月火炎，壬水解炎调候，庚金发水源，水火既济。" },   // 午
    { stems: [0, 8], reason: "未月火退，甲木生火，壬水解炎，甲壬各司其职。" },     // 未
    { stems: [0, 6], reason: "申月金旺，甲木生火制金，庚金劈甲，甲庚配合。" },     // 申
    { stems: [0, 6], reason: "酉月金旺火囚，甲庚为用，庚劈甲引丁火之明。" },       // 酉
    { stems: [0, 6], reason: "戌月火库土燥，甲木疏土生火，庚金劈甲。" },           // 戌
    { stems: [0, 6], reason: "亥月水旺火绝，甲木为急，庚金劈甲，甲庚救丁。" },     // 亥
  ],
  // 戊 Earth Yang (index 4)
  4: [
    { stems: [2, 0], reason: "子月冻土，丙火暖局为先，甲木疏土为次，无丙则土冻。" }, // 子
    { stems: [2, 0], reason: "丑月湿寒，丙火解冻暖土，甲木疏土通气。" },           // 丑
    { stems: [2, 9], reason: "寅月春回大地，丙火暖土，癸水润土，两不相害。" },     // 寅
    { stems: [2, 0], reason: "卯月木旺克土，丙火化木生土，甲木疏土防板结。" },     // 卯
    { stems: [0, 9], reason: "辰月土旺，甲木疏土为先，癸水润土防干裂。" },         // 辰
    { stems: [9, 2], reason: "巳月火炎土燥，癸水为先润土降温，丙火次之。" },       // 巳
    { stems: [8, 2], reason: "午月火炎土焦，壬水为急，解炎润土，丙火为辅。" },     // 午
    { stems: [9, 2], reason: "未月燥土，癸水润局，丙火暖土，水为主，火为辅。" },   // 未
    { stems: [2, 9], reason: "申月金泄土气，丙火生土，癸水润土，丙癸并济。" },     // 申
    { stems: [2, 9], reason: "酉月金旺土虚，丙火暖土生土，癸水润土防燥。" },       // 酉
    { stems: [0, 2], reason: "戌月燥土，甲木疏土，丙火暖局，甲丙为用。" },         // 戌
    { stems: [2, 0], reason: "亥月水旺土流，丙火暖土为先，甲木次之。" },           // 亥
  ],
  // 己 Earth Yin (index 5)
  5: [
    { stems: [2, 0], reason: "子月冻土不生，丙火暖局解冻，甲木疏土为次。" },       // 子
    { stems: [2, 0], reason: "丑月寒土，丙火解冻为先，甲木疏土通气。" },           // 丑
    { stems: [2, 9], reason: "寅月春土，丙火暖土，癸水润土，田园得治。" },         // 寅
    { stems: [2, 9], reason: "卯月木旺，丙火化木生土，癸水润局，丙癸为用。" },     // 卯
    { stems: [9, 2], reason: "辰月土湿，癸水润土为主，丙火暖土为辅。" },           // 辰
    { stems: [9, 2], reason: "巳月火旺土焦，癸水为急以润田园，丙火为辅。" },       // 巳
    { stems: [9, 2], reason: "午月炎夏，癸水为第一用神，解炎润土，丙火为辅。" },   // 午
    { stems: [9, 2], reason: "未月土燥，癸水润土，丙火暖土，各有其用。" },         // 未
    { stems: [2, 9], reason: "申月金旺，丙火生土，癸水润土，丙癸并重。" },         // 申
    { stems: [2, 9], reason: "酉月金泄土气，丙火暖土，癸水润土。" },               // 酉
    { stems: [0, 2], reason: "戌月燥土，甲木疏土为先，丙火暖土为次。" },           // 戌
    { stems: [2, 0], reason: "亥月水旺土湿，丙火暖土，甲木疏土，两不相误。" },     // 亥
  ],
  // 庚 Metal Yang (index 6)
  6: [
    { stems: [2, 0], reason: "子月金寒水冷，丙火暖金为先，甲木引火为辅。" },       // 子
    { stems: [2, 1], reason: "丑月湿寒，丙火暖金，乙木助火，丙火为尊。" },         // 丑
    { stems: [2, 8], reason: "寅月春寒，丙火暖金，壬水淘洗，丙壬并用。" },         // 寅
    { stems: [1, 0], reason: "卯月木旺，乙木合庚，甲木引丁，以火炼金。" },         // 卯
    { stems: [0, 1], reason: "辰月土重埋金，甲木疏土为先，乙木柔木为辅。" },       // 辰
    { stems: [8, 2], reason: "巳月火旺金熔，壬水淬金为先，丙火炼金为辅。" },       // 巳
    { stems: [8, 2], reason: "午月火炎熔金，壬水淘洗为急，丙火为辅。" },           // 午
    { stems: [1, 0], reason: "未月土燥，乙木疏土，甲木为辅，木疏土金。" },         // 未
    { stems: [1, 0], reason: "申月金旺，乙木合庚，甲木疏土为辅。" },               // 申
    { stems: [1, 2], reason: "酉月金锐，乙木合庚，丙火炼金成形，乙丙配合。" },     // 酉
    { stems: [0, 2], reason: "戌月燥土，甲木疏土，丙火暖金，甲丙为用。" },         // 戌
    { stems: [2, 1], reason: "亥月水冷金寒，丙火暖金，乙木助火，火为急务。" },     // 亥
  ],
  // 辛 Metal Yin (index 7)
  7: [
    { stems: [2, 8], reason: "子月水冷金寒，丙火暖局，壬水淘洗珠玉。" },           // 子
    { stems: [2], reason: "丑月寒湿，丙火暖金，寒谷回春，珠玉生辉。" },             // 丑
    { stems: [8, 5], reason: "寅月春寒，壬水淘洗为先，己土制水护金。" },           // 寅
    { stems: [8, 0], reason: "卯月木旺，壬水泄金，甲木引火，水火调候。" },         // 卯
    { stems: [8, 0], reason: "辰月土湿，壬水淘洗，甲木疏土，金玉得显。" },         // 辰
    { stems: [8, 5], reason: "巳月火旺，壬水淘洗调候，己土制水护辛。" },           // 巳
    { stems: [8, 5], reason: "午月烈火熔金，壬水为急以淘洗降温，己土为辅。" },     // 午
    { stems: [8, 0], reason: "未月土燥，壬水润金淘洗，甲木疏土。" },               // 未
    { stems: [8, 0], reason: "申月金水相生，壬水淘洗，甲木引火暖局。" },           // 申
    { stems: [8, 2], reason: "酉月金旺，壬水淘洗，丙火暖金，珠玉光华。" },         // 酉
    { stems: [8, 0], reason: "戌月燥土埋金，壬水淘洗为先，甲木疏土为次。" },       // 戌
    { stems: [2], reason: "亥月水旺金沉，丙火暖局为先，太阳一出金自明。" },         // 亥
  ],
  // 壬 Water Yang (index 8)
  8: [
    { stems: [4, 2], reason: "子月水旺，戊土筑堤为先，丙火暖局调候为次。" },       // 子
    { stems: [4, 0], reason: "丑月湿寒，戊土制水，甲木疏土，甲戊共济。" },         // 丑
    { stems: [4, 0], reason: "寅月春水泛滥，戊土为堤防，甲木疏土为辅。" },         // 寅
    { stems: [4, 0], reason: "卯月木旺泄水，戊土制水，甲木疏土以通水道。" },       // 卯
    { stems: [0, 6], reason: "辰月水库，甲木疏土，庚金生水，各有其用。" },         // 辰
    { stems: [8, 4], reason: "巳月火旺水枯，壬水比助为先，戊土制水护火。" },       // 巳
    { stems: [6, 4], reason: "午月火炎水涸，庚金生水为源，戊土筑堤防水。" },       // 午
    { stems: [0, 5], reason: "未月土燥克水，甲木疏土护水，己土柔顺为辅。" },       // 未
    { stems: [4, 1], reason: "申月水得长生，戊土堤防，乙木疏土为辅。" },           // 申
    { stems: [0, 6], reason: "酉月金生水旺，甲木引火，庚金生水，水火互济。" },     // 酉
    { stems: [0, 6], reason: "戌月水枯，甲木疏土，庚金发水源，救水为急。" },       // 戌
    { stems: [4, 6], reason: "亥月水旺，戊土筑堤制水，庚金生水为源。" },           // 亥
  ],
  // 癸 Water Yin (index 9)
  9: [
    { stems: [2, 7], reason: "子月水冷，丙火暖局解冻，辛金生水为源。" },           // 子
    { stems: [2, 7], reason: "丑月寒湿，丙火暖局，辛金发源，丙辛并用。" },         // 丑
    { stems: [2, 7], reason: "寅月春寒未尽，丙火暖局，辛金生水助癸。" },           // 寅
    { stems: [6, 7], reason: "卯月木旺泄水，庚金生水为源，辛金为辅。" },           // 卯
    { stems: [0, 6], reason: "辰月水库，甲木疏土通气，庚金生水发源。" },           // 辰
    { stems: [7, 2], reason: "巳月火炎水涸，辛金生水为急，丙火暖局为辅。" },       // 巳
    { stems: [6, 8], reason: "午月烈火煎水，庚金为源以生癸水，壬水助癸。" },       // 午
    { stems: [6, 7], reason: "未月土燥克水，庚金生水，辛金为辅，金生水润。" },     // 未
    { stems: [1, 2], reason: "申月金生水旺，乙木疏土，丙火暖水，调候为用。" },     // 申
    { stems: [7, 2], reason: "酉月金旺水相，辛金生水，丙火暖局，阴阳调和。" },     // 酉
    { stems: [7, 0], reason: "戌月燥土克水，辛金生水为源，甲木疏土为次。" },       // 戌
    { stems: [6, 7], reason: "亥月水旺，庚金生水为源，辛金为辅，金水相生。" },     // 亥
  ],
};

/**
 * Get the Tiao Hou (Climate Adjustment) recommendation for a given day stem and month branch.
 * @param dayStemIndex - Day master stem index (0=甲 ... 9=癸)
 * @param monthBranchIndex - Month branch index (0=子 ... 11=亥)
 */
export function getTiaoHou(dayStemIndex: number, monthBranchIndex: number): TiaoHouResult {
  const entries = TIAOHOU_TABLE[dayStemIndex];
  if (!entries || !entries[monthBranchIndex]) {
    return { stems: [], elements: [], reason: "此组合无需特别调候。" };
  }

  const entry = entries[monthBranchIndex];
  const stems = entry.stems.map((si) => STEMS[si]);
  const elements = [...new Set(entry.stems.map((si) => STEM_ELEMENTS[si]))];

  return { stems, elements, reason: entry.reason };
}
