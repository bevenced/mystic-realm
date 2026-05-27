// ===== 日柱等级与档案 (Day Pillar Grade & Profile) =====
// Traditional classification of all 60 JiaZi day pillars.
// Grades: "上等" (superior), "中等" (medium), "下等" (inferior)

export interface DayPillarGradeResult {
  /** The day pillar stem+branch, e.g. "甲子" */
  name: string;
  /** Grade: superior / medium / inferior */
  grade: "上等" | "中等" | "下等";
  gradeEn: "Superior" | "Medium" | "Inferior";
  /** Star rating 1-5 */
  stars: number;
  /** Profile description of this day pillar */
  profile: string;
  /** Key traits */
  traits: string[];
}

const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

// Grade data for all 60 combinations
// stemIndex * 12 + branchIndex maps to grade info
// Superior ≈ 30, Medium ≈ 15, Inferior ≈ 15
type GradeEntry = { grade: "上等" | "中等" | "下等"; stars: number; profile: string; traits: string[] };

const GRADE_DATA: Record<number, GradeEntry> = {
  // 甲木日柱 (indices 0-11)
  0:  { grade:"上等", stars:4, profile:"甲子日生，天德贵人日。甲木坐子水正印，木得水生，聪明仁厚。", traits:["聪明仁厚","学习力强","贵人相助"] },
  1:  { grade:"中等", stars:3, profile:"甲寅日生，建禄格。甲木坐寅为禄，身旺自主，个性刚强。", traits:["独立自主","个性刚强","行动力强"] },
  2:  { grade:"上等", stars:4, profile:"甲辰日生，龙守财库。甲木坐辰土偏财，辰为水库润木，财源稳定。", traits:["财运亨通","稳重踏实","善于管理"] },
  3:  { grade:"中等", stars:3, profile:"甲午日生，木火通明。甲木坐午火伤官，才华外露，性情刚烈。", traits:["才华横溢","性情刚烈","表现欲强"] },
  4:  { grade:"中等", stars:3, profile:"甲申日生，金木相战。甲坐申金七杀，杀印相生，有胆识魄力。", traits:["胆识过人","魄力十足","杀伐果断"] },
  5:  { grade:"上等", stars:4, profile:"甲戌日生，火库生财。甲坐戌土偏财，戌为火库生土，财旺身强。", traits:["财运旺盛","善于经营","务实可靠"] },
  6:  { grade:"上等", stars:5, profile:"甲寅日生，虎踞龙盘。甲坐寅为禄为根，木气充足，得天独厚。", traits:["得天独厚","根基稳固","领导才能"] },
  7:  { grade:"中等", stars:3, profile:"甲午日生，龙马精神。甲木坐午火，木火相生，精力充沛。", traits:["精力充沛","热情外向","创造力强"] },
  8:  { grade:"中等", stars:3, profile:"甲申日生，金猴献瑞。甲坐申金，杀印相生，机智善变。", traits:["机智灵活","应变力强","有胆有识"] },
  9:  { grade:"上等", stars:4, profile:"甲戌日生，火库藏财。甲木坐戌，火土相生，财官双美。", traits:["财官双美","稳重可靠","事业有成"] },
  10: { grade:"中等", stars:3, profile:"甲子日生，水木清华。甲坐子水为印，清贵之格，学识渊博。", traits:["清贵儒雅","学识渊博","心地善良"] },
  11: { grade:"下等", stars:2, profile:"甲戌日生，燥土克木。甲坐戌燥土，木被土困，需水润局。", traits:["易感压抑","需外力助","内敛深沉"] },

  // 乙木日柱 (indices 12-23) — stemIndex=1
  12: { grade:"上等", stars:5, profile:"乙丑日生，金库藏珠。乙坐丑土偏财，丑为金库，财官有库。", traits:["财运深厚","内秀外朴","福泽绵长"] },
  13: { grade:"中等", stars:3, profile:"乙卯日生，建禄格。乙坐卯为禄，藤萝茂盛，柔中带刚。", traits:["柔中带刚","适应力强","人缘好"] },
  14: { grade:"中等", stars:3, profile:"乙巳日生，木火通明。乙木坐巳火伤官，聪明灵秀，多才多艺。", traits:["聪明灵秀","多才多艺","表达力强"] },
  15: { grade:"中等", stars:3, profile:"乙未日生，木库藏财。乙坐未土偏财，未为木库，财有根源。", traits:["财运稳定","善于守成","温厚待人"] },
  16: { grade:"上等", stars:4, profile:"乙酉日生，金玉良缘。乙坐酉金七杀，将星入命，杀印相生。", traits:["将星之才","果断利落","有权威感"] },
  17: { grade:"中等", stars:3, profile:"乙亥日生，水木相生。乙坐亥水正印，水木清华，聪明仁厚。", traits:["仁厚聪慧","善解人意","心地善良"] },
  18: { grade:"下等", stars:2, profile:"乙丑日生，湿土困木。乙木坐丑湿土，木气受阻，需阳光普照。", traits:["怀才不遇","内向拘谨","需外力助"] },
  19: { grade:"中等", stars:3, profile:"乙卯日生，花木逢春。乙坐卯为禄，根基稳固，秀气外发。", traits:["秀外慧中","根基扎实","艺术天赋"] },
  20: { grade:"上等", stars:4, profile:"乙巳日生，木火文明。乙坐巳火，伤官生财，才华变现能力强。", traits:["才华变现","聪慧过人","善于表达"] },
  21: { grade:"中等", stars:3, profile:"乙未日生，花园之木。乙坐未土，木库藏根，温厚有涵养。", traits:["温厚有礼","涵养深厚","为人可靠"] },
  22: { grade:"中等", stars:3, profile:"乙酉日生，金剪修木。乙坐酉金，金克木为官，规则意识强。", traits:["遵守规则","条理分明","自律严格"] },
  23: { grade:"上等", stars:4, profile:"乙亥日生，水木清华。乙坐亥水，正印当令，清贵高雅。", traits:["清贵高雅","学识过人","心地光明"] },

  // 丙火日柱 (indices 24-35) — stemIndex=2
  24: { grade:"下等", stars:2, profile:"丙子日生，水火交战。丙坐子水正官，水火相激，性情多变。", traits:["性情多变","内心矛盾","情绪起伏"] },
  25: { grade:"中等", stars:3, profile:"丙寅日生，日出扶桑。丙坐寅木偏印，木火相生，光明磊落。", traits:["光明磊落","热情豪爽","积极向上"] },
  26: { grade:"中等", stars:3, profile:"丙辰日生，日照龙潭。丙坐辰土食神，火土相生，温和宽厚。", traits:["温和宽厚","心地善良","乐于助人"] },
  27: { grade:"上等", stars:5, profile:"丙午日生，烈日当空。丙坐午火羊刃，气势磅礴，领袖之才。", traits:["领袖气质","气势恢宏","热情奔放"] },
  28: { grade:"下等", stars:2, profile:"丙申日生，日落西山。丙坐申金偏财，财多身弱，心有余力不足。", traits:["心有余力不足","易疲倦","需蓄力待时"] },
  29: { grade:"上等", stars:4, profile:"丙戌日生，火库藏辉。丙坐戌土食神，戌为火库，光辉内蕴。", traits:["内蕴光华","稳重务实","厚积薄发"] },
  30: { grade:"下等", stars:2, profile:"丙子日生，阳火入水。丙坐子水，水火未济，事业多起伏。", traits:["事业起伏","大器晚成","磨砺成长"] },
  31: { grade:"上等", stars:4, profile:"丙寅日生，虎啸生风。丙坐寅木，木火相生，气势非凡。", traits:["气势非凡","领导风范","热情正直"] },
  32: { grade:"中等", stars:3, profile:"丙辰日生，龙潭映日。丙坐辰土，火土相生，稳重有谋。", traits:["稳重有谋","计划周详","执行力强"] },
  33: { grade:"下等", stars:2, profile:"丙午日生，火炎土燥。丙坐午火，火过旺则燥，需水调候。", traits:["性急如火","缺乏耐心","需冷静克制"] },
  34: { grade:"中等", stars:3, profile:"丙申日生，火炼真金。丙坐申金，火金相克，磨砺成才。", traits:["磨砺成才","意志坚定","大器晚成"] },
  35: { grade:"中等", stars:3, profile:"丙戌日生，火归库藏。丙坐戌火库，收敛光华，内有乾坤。", traits:["内有乾坤","深藏不露","厚积薄发"] },

  // 丁火日柱 (indices 36-47) — stemIndex=3
  36: { grade:"中等", stars:3, profile:"丁丑日生，灯火映辉。丁坐丑土食神，丑中藏金生水，暗中有助。", traits:["暗中有助","温和细致","心思细腻"] },
  37: { grade:"上等", stars:4, profile:"丁卯日生，灯花报喜。丁坐卯木偏印，木火相生，文明之象。", traits:["文明有礼","知书达理","温和儒雅"] },
  38: { grade:"中等", stars:3, profile:"丁巳日生，灯火通明。丁坐巳火劫财，火火相助，热情洋溢。", traits:["热情洋溢","朋友众多","慷慨大方"] },
  39: { grade:"下等", stars:2, profile:"丁未日生，灯火将尽。丁坐未土食神，火退气，宜守不宜攻。", traits:["宜守不宜攻","退而蓄力","以静制动"] },
  40: { grade:"上等", stars:4, profile:"丁酉日生，灯映金玉。丁坐酉金偏财，灯光映金辉，财名双收。", traits:["财名双收","精打细算","眼光独到"] },
  41: { grade:"中等", stars:3, profile:"丁亥日生，灯照寒江。丁坐亥水正官，水火相映，官星得位。", traits:["官星得位","正直不阿","清廉自守"] },
  42: { grade:"下等", stars:2, profile:"丁丑日生，湿土晦火。丁坐丑湿土，火光被掩，怀才不遇。", traits:["怀才不遇","忍耐待时","内心炽热"] },
  43: { grade:"中等", stars:3, profile:"丁卯日生，花灯初上。丁坐卯木，文明有礼，艺术天赋。", traits:["艺术天赋","文雅有礼","感情丰富"] },
  44: { grade:"中等", stars:3, profile:"丁巳日生，双火争辉。丁坐巳火，力量倍增，但需防燥进。", traits:["精力旺盛","行动迅速","需防急躁"] },
  45: { grade:"下等", stars:2, profile:"丁未日生，灯火将熄。丁坐未燥土，火光微弱，需添油助力。", traits:["需外力助","不可冒进","稳健为上"] },
  46: { grade:"上等", stars:5, profile:"丁酉日生，珠玉映辉。丁坐酉金，偏财得位，天乙贵人入命。", traits:["贵人相助","财运亨通","品位高雅"] },
  47: { grade:"中等", stars:3, profile:"丁亥日生，灯辉映水。丁坐亥水，官印相生，贵气暗藏。", traits:["贵气暗藏","内秀外朴","清廉自持"] },

  // 戊土日柱 (indices 48-59) — stemIndex=4
  48: { grade:"中等", stars:3, profile:"戊子日生，山环水抱。戊坐子水正财，土水相克，财来财去。", traits:["财运起伏","善于经营","得失随缘"] },
  49: { grade:"上等", stars:4, profile:"戊寅日生，虎踞山岗。戊坐寅木七杀，杀印相生，将帅之才。", traits:["将帅之风","有胆有识","杀伐决断"] },
  50: { grade:"中等", stars:3, profile:"戊辰日生，龙盘厚土。戊坐辰土比肩，辰为水库润土，根基稳固。", traits:["根基稳固","为人厚道","值得信赖"] },
  51: { grade:"中等", stars:3, profile:"戊午日生，烈马奔腾。戊坐午火正印，火土相生，热情正直。", traits:["热情正直","积极进取","光明磊落"] },
  52: { grade:"下等", stars:2, profile:"戊申日生，山遇金猴。戊坐申金食神，土生金泄气，易感疲惫。", traits:["易感疲惫","付出多回报少","乐天知命"] },
  53: { grade:"上等", stars:4, profile:"戊戌日生，魁罡重土。戊坐戌土比肩，戌为火库生土，气魄非凡。", traits:["气魄非凡","意志坚定","重信守诺"] },
  54: { grade:"中等", stars:3, profile:"戊子日生，高山流水。戊坐子水，正财得位，稳重求财。", traits:["稳重求财","计划性强","不急不躁"] },
  55: { grade:"上等", stars:4, profile:"戊寅日生，虎踞山林。戊坐寅木，杀印相生，威而不猛。", traits:["威而不猛","外刚内柔","领导气质"] },
  56: { grade:"中等", stars:3, profile:"戊辰日生，厚土载物。戊坐辰土，比肩相助，团结力量大。", traits:["团结协作","厚德载物","宽厚待人"] },
  57: { grade:"下等", stars:2, profile:"戊午日生，燥土烈马。戊坐午火，火炎土燥，需水润局。", traits:["性急刚烈","需水调和","刚则易折"] },
  58: { grade:"中等", stars:3, profile:"戊申日生，金山玉土。戊坐申金，食神生财，才华变现。", traits:["才华变现","聪明机智","善于表达"] },
  59: { grade:"上等", stars:4, profile:"戊戌日生，魁罡之土。戊坐戌火库，内蕴光华，外示敦厚。", traits:["外敦内明","深藏不露","厚积薄发"] },

  // 己土日柱 (indices 60-71) — stemIndex=5
  60: { grade:"下等", stars:2, profile:"己丑日生，寒土湿泥。己坐丑土比肩，湿寒之土，需阳光普照。", traits:["怀才不遇","需温暖助","内敛自省"] },
  61: { grade:"上等", stars:4, profile:"己卯日生，田园花开。己坐卯木七杀，田园有花木点缀，秀美之格。", traits:["秀外慧中","文雅有礼","艺术气息"] },
  62: { grade:"中等", stars:3, profile:"己巳日生，暖土生辉。己坐巳火正印，火土相生，温和善良。", traits:["温和善良","心地仁慈","乐于助人"] },
  63: { grade:"下等", stars:2, profile:"己未日生，厚土埋金。己坐未土比肩，土重为病，需木疏土。", traits:["固执守旧","缺乏变通","稳重可靠"] },
  64: { grade:"上等", stars:4, profile:"己酉日生，田园生金。己坐酉金食神，土生金泄秀，智慧生财。", traits:["智慧生财","心灵手巧","善于经营"] },
  65: { grade:"中等", stars:3, profile:"己亥日生，田园得水。己坐亥水正财，水润田园，财源不断。", traits:["财源不断","善于理财","稳重踏实"] },
  66: { grade:"下等", stars:2, profile:"己丑日生，冻土不生。己坐丑寒土，无火则万物不生。", traits:["时运未至","耐心等待","守成待时"] },
  67: { grade:"中等", stars:3, profile:"己卯日生，田园春色。己坐卯木，克中有情，文武双全。", traits:["文武双全","才情兼备","应变力强"] },
  68: { grade:"中等", stars:3, profile:"己巳日生，暖土育物。己坐巳火，印星得位，学识丰富。", traits:["学识丰富","温和有礼","善良正直"] },
  69: { grade:"下等", stars:2, profile:"己未日生，土重金埋。己坐未燥土，土多金埋，才华难展。", traits:["才华被掩","需外力发掘","耐心积累"] },
  70: { grade:"上等", stars:5, profile:"己酉日生，金白水清。己坐酉金，文昌贵人入命，才华卓越。", traits:["才华卓越","文昌贵人","聪慧过人"] },
  71: { grade:"中等", stars:3, profile:"己亥日生，田园水润。己坐亥水，正财当令，财官双美。", traits:["财官双美","善于经营","温润如玉"] },

  // 庚金日柱 (indices 72-83) — stemIndex=6
  72: { grade:"下等", stars:2, profile:"庚子日生，金沉水底。庚坐子水伤官，金生水泄气，才多身弱。", traits:["才多身弱","思想深邃","体力不足"] },
  73: { grade:"中等", stars:3, profile:"庚寅日生，金虎相逢。庚坐寅木偏财，金克木得财，魄力十足。", traits:["魄力十足","敢于冒险","开拓进取"] },
  74: { grade:"中等", stars:3, profile:"庚辰日生，金龙得库。庚坐辰土偏印，辰为水库生金，气度不凡。", traits:["气度不凡","眼光长远","深谋远虑"] },
  75: { grade:"上等", stars:4, profile:"庚午日生，火炼真金。庚坐午火正官，火炼金刚，大器之才。", traits:["大器之才","意志如钢","百炼成才"] },
  76: { grade:"上等", stars:4, profile:"庚申日生，双金得禄。庚坐申金比肩，申为庚禄，刚健有力。", traits:["刚健有力","自主独立","行动力强"] },
  77: { grade:"中等", stars:3, profile:"庚戌日生，金藏火库。庚坐戌土偏印，戌中藏火炼金成器。", traits:["成器之才","外圆内方","刚柔并济"] },
  78: { grade:"下等", stars:2, profile:"庚子日生，寒金入水。庚坐子水，金寒水冷，需火暖局。", traits:["怀才不遇","内心孤傲","需阳光温暖"] },
  79: { grade:"中等", stars:3, profile:"庚寅日生，金克木财。庚坐寅木，偏财旺相，财运不错。", traits:["财运不错","敢于投资","经商头脑"] },
  80: { grade:"中等", stars:3, profile:"庚辰日生，龙潭金魄。庚坐辰土，水库润金，财源暗藏。", traits:["财源暗藏","稳重有谋","厚积薄发"] },
  81: { grade:"上等", stars:5, profile:"庚午日生，真金烈火。庚坐午火正官，官星得位，贵气逼人。", traits:["贵气逼人","正直刚毅","事业有成"] },
  82: { grade:"上等", stars:4, profile:"庚申日生，双金强旺。庚坐申为禄，身旺能任财官，刚健有为。", traits:["刚健有为","独立自强","领袖风范"] },
  83: { grade:"中等", stars:3, profile:"庚戌日生，金归火库。庚坐戌土，火土相生炼金，磨砺成才。", traits:["磨砺成才","意志坚定","不畏艰难"] },

  // 辛金日柱 (indices 84-95) — stemIndex=7
  84: { grade:"中等", stars:3, profile:"辛丑日生，金入宝库。辛坐丑土偏印，丑为金库，内秀外朴。", traits:["内秀外朴","暗藏珠玉","大智若愚"] },
  85: { grade:"中等", stars:3, profile:"辛卯日生，珠玉逢木。辛坐卯木偏财，金克木为财，精打细算。", traits:["精打细算","善于理财","眼光精准"] },
  86: { grade:"上等", stars:4, profile:"辛巳日生，金玉生辉。辛坐巳火正官，火炼金辉，官星得位。", traits:["官星得位","事业有成","光彩照人"] },
  87: { grade:"下等", stars:2, profile:"辛未日生，珠玉蒙尘。辛坐未土偏印，燥土埋金，才华难展。", traits:["才华被掩","怀才不遇","耐心等待"] },
  88: { grade:"上等", stars:5, profile:"辛酉日生，双金得禄。辛坐酉金比肩，酉为辛禄，珠玉双全。", traits:["珠玉双全","才华出众","风姿卓越"] },
  89: { grade:"中等", stars:3, profile:"辛亥日生，金水相生。辛坐亥水伤官，金白水清，聪明灵秀。", traits:["聪明灵秀","才思敏捷","清新脱俗"] },
  90: { grade:"中等", stars:3, profile:"辛丑日生，金玉在库。辛坐丑金库，内藏珠玉，待人发掘。", traits:["内藏才华","沉稳内敛","不露锋芒"] },
  91: { grade:"下等", stars:2, profile:"辛卯日生，珠玉被克。辛坐卯木，金木相战，内心矛盾。", traits:["内心矛盾","左右为难","需抉择取舍"] },
  92: { grade:"中等", stars:3, profile:"辛巳日生，火炼金辉。辛坐巳火，正官当令，贵气自生。", traits:["贵气自生","正直诚信","责任心强"] },
  93: { grade:"下等", stars:2, profile:"辛未日生，燥土埋金。辛坐未燥土，珠玉蒙尘，需水淘洗。", traits:["时运不济","需水淘洗","守得云开"] },
  94: { grade:"中等", stars:3, profile:"辛酉日生，金鸡独立。辛坐酉为禄，身旺自持，风骨清高。", traits:["风骨清高","独立自主","洁身自好"] },
  95: { grade:"上等", stars:4, profile:"辛亥日生，金水相涵。辛坐亥水，伤官泄秀，聪慧过人，才华横溢。", traits:["才华横溢","聪慧过人","清秀脱俗"] },

  // 壬水日柱 (indices 96-107) — stemIndex=8
  96: { grade:"上等", stars:4, profile:"壬子日生，双水旺相。壬坐子水劫财，水势浩大，气魄非凡。", traits:["气魄非凡","胸怀广阔","志向远大"] },
  97: { grade:"中等", stars:3, profile:"壬寅日生，江河奔虎。壬坐寅木食神，水生木泄秀，才华外露。", traits:["才华外露","善于表达","思维活跃"] },
  98: { grade:"中等", stars:3, profile:"壬辰日生，龙归大海。壬坐辰土七杀，辰为水库，杀印相生。", traits:["杀印相生","有勇有谋","深藏不露"] },
  99: { grade:"中等", stars:3, profile:"壬午日生，水火既济。壬坐午火正财，水火相交，财运亨通。", traits:["财运亨通","善于交际","八面玲珑"] },
  100:{ grade:"下等", stars:2, profile:"壬申日生，水泄金气。壬坐申金偏印，金生水过旺，身旺无依。", traits:["身旺无依","漂泊不定","聪明反被聪明误"] },
  101:{ grade:"上等", stars:4, profile:"壬戌日生，水归火库。壬坐戌土七杀，戌中藏火生土，杀印相生。", traits:["杀印相生","外刚内柔","刚毅果断"] },
  102:{ grade:"中等", stars:3, profile:"壬子日生，汪洋大海。壬坐子水，水势奔腾，志向高远。", traits:["志向高远","胸襟开阔","不安于室"] },
  103:{ grade:"上等", stars:4, profile:"壬寅日生，虎啸江河。壬坐寅木，食神得位，才华出众。", traits:["才华出众","创意无限","领导气质"] },
  104:{ grade:"中等", stars:3, profile:"壬辰日生，水库之龙。壬坐辰水库，水有归宿，稳重有谋。", traits:["稳重有谋","计划周全","步步为营"] },
  105:{ grade:"下等", stars:2, profile:"壬午日生，水火相冲。壬坐午火，水火交战，心绪不宁。", traits:["心绪不宁","起伏不定","大起大落"] },
  106:{ grade:"中等", stars:3, profile:"壬申日生，金水滔滔。壬坐申金，金生水旺，智慧过人。", traits:["智慧过人","思维敏捷","辩才无碍"] },
  107:{ grade:"中等", stars:3, profile:"壬戌日生，水入火库。壬坐戌土，七杀当令，有勇有谋。", traits:["有勇有谋","刚柔并济","外圆内方"] },

  // 癸水日柱 (indices 108-119) — stemIndex=9
  108:{ grade:"中等", stars:3, profile:"癸丑日生，雨露润土。癸坐丑土七杀，丑中藏金生水，暗中有助。", traits:["暗中有助","心思细腻","善解人意"] },
  109:{ grade:"上等", stars:4, profile:"癸卯日生，雨露润木。癸坐卯木食神，水生木泄秀，文采斐然。", traits:["文采斐然","才华横溢","温文尔雅"] },
  110:{ grade:"中等", stars:3, profile:"癸巳日生，雨露得火。癸坐巳火正财，水火相济，财运平稳。", traits:["财运平稳","温润和煦","善于持家"] },
  111:{ grade:"下等", stars:2, profile:"癸未日生，雨露入燥土。癸坐未土七杀，燥土吸水，心力交瘁。", traits:["心力交瘁","付出多回报少","需休养生息"] },
  112:{ grade:"上等", stars:4, profile:"癸酉日生，金生丽水。癸坐酉金偏印，金白水清，聪慧过人。", traits:["聪慧过人","清秀脱俗","心思缜密"] },
  113:{ grade:"中等", stars:3, profile:"癸亥日生，双水归源。癸坐亥水劫财，水势浩荡，志向远大。", traits:["志向远大","胸襟开阔","不安现状"] },
  114:{ grade:"下等", stars:2, profile:"癸丑日生，寒水湿泥。癸坐丑湿土，水冷土寒，需阳光暖局。", traits:["怀才不遇","需温暖助","耐心等候"] },
  115:{ grade:"中等", stars:3, profile:"癸卯日生，春霖润木。癸坐卯木，水生木，文采光华。", traits:["文采光华","才思泉涌","善于表达"] },
  116:{ grade:"中等", stars:3, profile:"癸巳日生，雨露朝阳。癸坐巳火正财，水火既济，温和有福。", traits:["温和有福","知足常乐","善于理财"] },
  117:{ grade:"下等", stars:2, profile:"癸未日生，雨入干土。癸坐未燥土，水被土克，心力不足。", traits:["心力不足","易感疲惫","需休养生息"] },
  118:{ grade:"上等", stars:5, profile:"癸酉日生，金水相生。癸坐酉金，天乙贵人入命，聪慧灵秀。", traits:["聪慧灵秀","贵气不凡","才华横溢"] },
  119:{ grade:"中等", stars:3, profile:"癸亥日生，大海之水。癸坐亥水，水势宏大，志在四方。", traits:["志在四方","不安于室","胸襟广阔"] },
};

/**
 * Get the grade and profile for a day pillar.
 * @param dayStemIndex - Day stem index (0=甲 ... 9=癸)
 * @param dayBranchIndex - Day branch index (0=子 ... 11=亥)
 */
export function getDayPillarGrade(dayStemIndex: number, dayBranchIndex: number): DayPillarGradeResult {
  const key = dayStemIndex * 12 + dayBranchIndex;
  const entry = GRADE_DATA[key];

  const name = STEMS[dayStemIndex] + BRANCHES[dayBranchIndex];

  if (!entry) {
    return {
      name,
      grade: "中等",
      gradeEn: "Medium",
      stars: 3,
      profile: `${name}日生，此日柱中正平和，需观全局而定。`,
      traits: ["中正平和", "可塑性高"],
    };
  }

  return {
    name,
    grade: entry.grade,
    gradeEn: entry.grade === "上等" ? "Superior" : entry.grade === "下等" ? "Inferior" : "Medium",
    stars: entry.stars,
    profile: entry.profile,
    traits: entry.traits,
  };
}
