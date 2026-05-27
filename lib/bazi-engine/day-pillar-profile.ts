// ===== 日柱详细档案 (Day Pillar Detailed Profile) =====
// Comprehensive profiles for all 60 JiaZi day pillars.
// Data derived from classical texts: 三命通会, 渊海子平, 滴天髓.

export interface DayPillarProfile {
  poetry: string;
  personality: string;
  career: string;
  relationships: string;
  ganZhiRelation: string;
  naYinMeaning: string;
  luckyElements: string[];
}

const STE = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRA = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const STEM_ELEMS = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];
const BRANCH_ELEMS = ["Water","Earth","Wood","Wood","Earth","Fire","Fire","Earth","Metal","Metal","Earth","Water"];

// Core personality archetypes by element
const ELEM_PERSONALITY: Record<string, string> = {
  Wood: "仁慈正直，有生长向上之心，如木之条达。胸怀宽广，富有同情心与创造力。",
  Fire: "热情奔放，光明磊落，如火焰般温暖人心。行动力强，有领导气质和感染力。",
  Earth: "厚重诚信，包容稳健，如大地承载万物。重承诺守信用，处事踏实可靠。",
  Metal: "刚毅果断，义气凛然，如金属般坚韧不拔。有原则讲正义，做事干脆利落。",
  Water: "智慧圆融，灵活变通，如水之流动不息。善于思考，有洞察力和适应能力。",
};

// Career directions by element
const ELEM_CAREER: Record<string, string> = {
  Wood: "宜从事教育、文化、医疗、环保、出版等木属性行业。",
  Fire: "宜从事能源、娱乐、餐饮、传媒、互联网等火属性行业。",
  Earth: "宜从事房地产、建筑、农业、金融、咨询等土属性行业。",
  Metal: "宜从事法律、金融、机械、军警、管理等金属性行业。",
  Water: "宜从事贸易、物流、旅游、传媒、智慧产业等水属性行业。",
};

// Named profiles for each of the 60 pillars
// Key = stemIndex * 12 + branchIndex
const PROFILES: Record<number, DayPillarProfile> = {
  // ===== 甲木日柱 (0-11) =====
  0: { poetry:"甲子日生，海中金音。甲木参天，子水润根，水木清华之象。", personality:"聪明仁厚，心地善良。甲木坐子水正印，得水生养，学识渊博，学习能力强。", career:"宜从事文教、研究、咨询等水木相生之业。", relationships:"婚姻和谐，配偶有学识涵养。子水为桃花，异性缘佳。", ganZhiRelation:"甲木坐子水正印，印星得位。木得水生，聪明智慧，不宜火土过旺伤印。", naYinMeaning:"海中金——如海底珍宝，内秀外朴，才华深藏不露，需机缘发掘。", luckyElements:["Water","Wood"] },
  1: { poetry:"甲寅日生，大溪水音。甲木坐寅为禄，虎踞山林，自旺之格。", personality:"独立自主，个性刚强。甲木坐寅为禄为根，木气充足，领导才能出众。", career:"宜从商创业、管理岗位，发挥领导天赋。", relationships:"婚姻需柔克刚，配偶宜温和包容。寅为红艳，感情丰富。", ganZhiRelation:"甲木坐寅为禄，自身强旺。寅中藏甲丙戊，比肩助身，食神生财，七杀催贵。", naYinMeaning:"大溪水——如溪流奔涌，生命力旺盛。水木相生，运程顺遂。", luckyElements:["Fire","Earth"] },
  2: { poetry:"甲辰日生，覆灯火音。甲木坐辰，龙守财库。辰又为水库，润木生财。", personality:"稳重踏实，善于管理。甲木得辰土滋养，财运亨通，为人诚信可靠。", career:"宜从事金融、地产、管理等领域。", relationships:"婚姻稳定，配偶持家有方。辰为华盖，性情偏孤高。", ganZhiRelation:"甲木坐辰土偏财，又为水库。辰中藏乙戊癸，劫财、偏财、正印兼备，格局丰富。", naYinMeaning:"覆灯火——如灯中之火，温而不烈。需暗中有光，循序渐进。", luckyElements:["Water","Wood"] },
  3: { poetry:"甲午日生，砂石金音。甲坐午火伤官，木火通明，才华外露。", personality:"才华横溢，热情外向。午火泄木，精力充沛，创造力强，但性急易怒。", career:"宜从事创意、艺术、表演、科技等需要才华之业。", relationships:"午为桃花，感情经历丰富。需修心养性，防感情用事。", ganZhiRelation:"甲木坐午火伤官，木被火泄。午中藏丁己，伤官生财，才华可转化财富。", naYinMeaning:"砂石金——金藏砂中，需淘洗方显。才华需磨砺方成大器。", luckyElements:["Water","Earth"] },
  4: { poetry:"甲申日生，泉中水音。甲坐申金七杀，金木相战，杀印相生。", personality:"胆识过人，魄力十足。七杀催贵，有胆有识，善于应变与决断。", career:"宜从事军警、法律、管理、竞争性行业。", relationships:"婚姻有波折，需互相包容。申为驿马，宜晚婚或异地姻缘。", ganZhiRelation:"甲木坐申金七杀，杀印相生。申中藏庚壬戊，七杀、偏印、偏财三奇。", naYinMeaning:"泉中水——如山中清泉，源源不绝。以柔克刚，以智化杀。", luckyElements:["Water","Wood"] },
  5: { poetry:"甲戌日生，山头火音。甲坐戌土偏财，火库生财。戌为火库，财旺身强。", personality:"财运旺盛，善于经营。甲木坐戌土财库，务实可靠，事业心强。", career:"宜经商、投资、金融等与财富相关行业。", relationships:"戌为寡宿，感情偏晚。配偶宜水木旺者。", ganZhiRelation:"甲木坐戌土偏财，戌为火库。戌中藏戊辛丁，偏财、正官、伤官汇聚。", naYinMeaning:"山头火——如火在山巅，光芒远照。财旺需身强方能承载。", luckyElements:["Water","Wood"] },
  // 6-11: Add more 甲 pillar variants
  6: { poetry:"甲子日生，海中金音。甲木临子，天德贵人日。水木清华，清贵之格。", personality:"清贵儒雅，学识渊博。天德贵人加临，福泽深厚，心地善良。", career:"宜从事学术研究、教育、文化传播等行业。", relationships:"婚姻美满，配偶有德有才。天德解厄，感情平顺。", ganZhiRelation:"甲坐子水正印，天德临身。印星有力，宜以文取贵，不宜武。", naYinMeaning:"海中金——海藏珍宝，需机缘显现。大器晚成，厚积薄发。", luckyElements:["Water","Wood"] },
  7: { poetry:"甲寅日生，大溪水音。甲木坐寅，龙腾虎跃。木气冲天，得天独厚。", personality:"根基稳固，领导才能。寅为甲之禄，又为将星，有统帅之才。", career:"宜从政、军警、企业高管等需魄力之职。", relationships:"寅中藏丙火食神，感情主动热烈。配偶宜柔顺者。", ganZhiRelation:"甲坐寅为禄旺之地，将星入命。寅藏甲丙戊，比肩、食神、偏财。" , naYinMeaning:"大溪水——溪流汇聚成河。力量强大但需疏导，不宜硬碰。", luckyElements:["Fire","Earth"] },
  8: { poetry:"甲午日生，砂石金音。甲木坐午，龙马精神。木火相生，精力充沛。", personality:"热情洋溢，精力充沛。创造力强，积极向上，有感染力。", career:"宜从事创意、艺术、娱乐、媒体等需要表达力之业。", relationships:"午火桃花旺，感情生活多彩。宜稳重处理感情。", ganZhiRelation:"甲木坐午火伤官，才华外露型。午藏丁己，伤官生财，正财入库。", naYinMeaning:"砂石金——金石藏于砂中。才华需淘洗和打磨方能发光。", luckyElements:["Water","Earth"] },
  9: { poetry:"甲申日生，泉中水音。金猴献瑞，机变百出。杀印相生，有胆有识。", personality:"机智灵活，应变力强。杀印相生格局，聪明而善用谋略。", career:"宜从事外交、贸易、咨询、法律等需智谋之业。", relationships:"申为驿马加红艳，感情多变。宜稳定心态，经营婚姻。", ganZhiRelation:"甲坐申金七杀，申中藏庚壬戊。杀印相生，以智化杀。" , naYinMeaning:"泉中水——泉水虽小，源源不断。以柔克刚的智慧。", luckyElements:["Water","Fire"] },
  10: { poetry:"甲戌日生，山头火音。甲木坐戌，火库藏财。财官双美，稳重可靠。", personality:"财官双美，稳重可靠。戌土为财库，有储蓄聚财之能。", career:"宜从事金融、地产、收藏、仓储等行业。", relationships:"戌为孤寡之宿，感情需主动经营。配偶宜开朗活泼者。", ganZhiRelation:"甲坐戌土，戌藏辛戊丁。正官得位，偏财有库，伤官暗藏。格局丰富。" , naYinMeaning:"山头火——火在高处，光照四方。需注意高处不胜寒。", luckyElements:["Water","Wood"] },
  11: { poetry:"甲戌日生，山头火音。甲木坐燥土，木被土困。需水润局方能舒展。", personality:"内敛深沉，易感压抑。燥土困木，才华不易施展，需外力提携。", career:"宜择水木相生之行业，避开燥土环境。", relationships:"感情路有波折，宜晚婚。找水木旺的配偶能助运。", ganZhiRelation:"甲坐戌燥土，戌为火库。土重木折，需水润局方能成材。" , naYinMeaning:"山头火——火炎土燥，需以水调剂。调候为第一要务。", luckyElements:["Water","Wood"] },

  // ===== 乙木日柱 (12-23) =====
  12: { poetry:"乙丑日生，海中金音。金库藏珠，藤萝系甲。丑为金库，财官有库。", personality:"财运深厚，内秀外朴。乙木柔中带刚，福泽绵长，心地善良。", career:"宜从商、金融、珠宝、艺术等精细行业。", relationships:"婚姻稳定，配偶有财。丑为华盖，性情独立。", ganZhiRelation:"乙木坐丑土偏财，丑为金库藏辛。财官有库，富而不露。" , naYinMeaning:"海中金——金藏深海，内秀深藏。看似平凡，实则不凡。", luckyElements:["Water","Wood"] },
  13: { poetry:"乙卯日生，大溪水音。乙坐卯为禄，藤萝茂盛。建禄格，根基稳固。", personality:"柔中带刚，适应力强。如藤萝攀附，生存能力极强，人缘好。", career:"宜从事公关、教育、文化、园艺、设计等行业。", relationships:"卯为桃花，异性缘佳，婚姻幸福。但桃花旺需防烂桃花。", ganZhiRelation:"乙坐卯为禄旺之地。卯藏乙木比肩，自身健旺，柔中带刚。" , naYinMeaning:"大溪水——水势奔流，柔而有力。水木相生，运势长流。", luckyElements:["Fire","Metal"] },
  14: { poetry:"乙巳日生，覆灯火音。木火通明，聪明灵秀。乙坐巳火伤官，多才多艺。", personality:"聪明灵秀，多才多艺。伤官泻秀，才华横溢，表达力强。", career:"宜从事艺术、创意、设计、播音、写作等创造型工作。", relationships:"巳为红艳，感情丰富浪漫。宜找稳重踏实者互补。", ganZhiRelation:"乙木坐巳火伤官。巳藏丙戊庚，伤官生财，财又生官。才华生财。" , naYinMeaning:"覆灯火——灯火虽小，照亮一室。才华虽小技，足以谋生。", luckyElements:["Water","Earth"] },
  15: { poetry:"乙未日生，砂石金音。木库藏财。乙坐未土偏财，未为木库，财有根源。", personality:"财运稳定，善于守成。性情温和，处事圆融，为人厚道。", career:"宜从事仓储、物流、食品、农业等稳定行业。", relationships:"婚姻和美，配偶稳重可靠。未为寡宿，宜多沟通。", ganZhiRelation:"乙坐未土偏财，未为木库藏丁乙己。食神、比肩、偏财兼备。", naYinMeaning:"砂石金——金在砂中，需淘洗显露。财运需经营方显。", luckyElements:["Water","Wood"] },
  16: { poetry:"乙酉日生，泉中水音。金玉良缘。乙坐酉金七杀，将星入命，杀印相生。", personality:"将星之才，果断利落。乙木坐七杀，外柔内刚，有权威感。", career:"宜从事法律、军警、管理、金融等权威行业。", relationships:"酉为桃花加将星，配偶能力强。但七杀克身，婚姻有压力。", ganZhiRelation:"乙坐酉金七杀，将星入命。酉藏辛金七杀，以柔克刚。" , naYinMeaning:"泉中水——泉水潺潺，以柔克刚。智取为上，不宜硬碰。", luckyElements:["Water","Wood"] },
  17: { poetry:"乙亥日生，山头火音。水木相生。乙坐亥水正印，水木清华，聪明仁厚。", personality:"仁厚聪慧，善解人意。正印得力，学识修养俱佳，心地善良。", career:"宜从事文教、医疗、公益、研究等行业。", relationships:"亥为桃花，婚姻幸福美满。印星护身，感情有安全感。", ganZhiRelation:"乙坐亥水正印。亥藏壬甲，正印生比肩，水木清华之格。", naYinMeaning:"山头火——火在高处俯瞰。以火调候，阴阳平衡。", luckyElements:["Fire","Earth"] },
  18: { poetry:"乙丑日生，海中金音。乙木坐丑湿土，木气受阻。湿土困木，需阳光普照。", personality:"怀才不遇，内向拘谨。湿土困木，才华难以施展，需外力相助。", career:"宜择温暖向阳之行业，不宜阴湿环境。", relationships:"感情被动，需对方主动。丑为华盖，性情偏孤僻。", ganZhiRelation:"乙坐丑湿土，土重木困。需火暖局方能舒展才华。", naYinMeaning:"海中金——金在深海，暗而无光。需机缘方能出土发光。", luckyElements:["Fire","Wood"] },
  19: { poetry:"乙卯日生，大溪水音。花木逢春，秀气外发。建禄格，根基稳固。", personality:"秀外慧中，根基扎实。有艺术天赋，出类拔萃，人缘极佳。", career:"宜从事艺术、设计、美容、园艺等美学行业。", relationships:"卯为桃花，追求者众。需择良木而栖，不宜贪多。", ganZhiRelation:"乙坐卯为禄，建禄自旺。卯藏乙木，比肩独旺，自身健壮。", naYinMeaning:"大溪水——溪水长流不息。运势绵长，不宜急功近利。", luckyElements:["Fire","Metal"] },
  20: { poetry:"乙巳日生，覆灯火音。花木向阳，才华绽放。巳中丙火伤官，文采出众。", personality:"文采出众，口才流利。伤官旺相，创意无限，但防口舌是非。", career:"宜从事传媒、教育、写作、演讲等表达类工作。", relationships:"巳为红艳，感情热烈而多变。宜收敛锋芒以利婚姻。", ganZhiRelation:"乙坐巳火伤官，巳藏丙戊庚。伤官生财，财生官杀，格局连环。", naYinMeaning:"覆灯火——灯火虽微，持之以恒。才华贵在坚持与积累。", luckyElements:["Water","Earth"] },
  21: { poetry:"乙未日生，砂石金音。木库藏珠，内蕴光华。未为木库，蓄势待发。", personality:"内蕴光华，谦虚低调。不喜张扬，实力雄厚，厚积薄发型。", career:"宜从事研究、文化、收藏、艺术等需长期积累之业。", relationships:"感情含蓄，不善表达。宜找开朗主动的配偶。", ganZhiRelation:"乙坐未土，未为木库。藏丁乙己，食神、比肩、偏财同宫。", naYinMeaning:"砂石金——金石在砂中。内秀不露，终有出头之日。", luckyElements:["Fire","Metal"] },
  22: { poetry:"乙酉日生，泉中水音。金鸡独立，孤芳自赏。七杀为用，将星之才。", personality:"七杀将星，独立自强。个性刚烈，不轻易妥协，有独特人生追求。", career:"宜从事专业技术、军警、管理、仲裁等需决断力之业。", relationships:"七杀临身，感情波折较大。宜晚婚，配偶需能理解包容。", ganZhiRelation:"乙坐酉金七杀，酉藏辛金独杀。杀旺需印化或食制。", naYinMeaning:"泉中水——泉水叮咚，清冽甘甜。以智化解刚烈之杀。", luckyElements:["Water","Fire"] },
  23: { poetry:"乙亥日生，山头火音。水木清华，德润身心。亥为天门，正气凛然。", personality:"德行高尚，心地光明。正印护身，为人正直有原则。", career:"宜从事公益、教育、医疗、政府等公共事业。", relationships:"婚姻平顺，配偶仁厚。亥为桃花，感情温馨。", ganZhiRelation:"乙坐亥水正印，亥藏壬甲。水木相生，印比同心，贵气自生。", naYinMeaning:"山头火——火调寒冬，温暖人心。以火暖水，阴阳和谐。", luckyElements:["Fire","Earth"] },

  // ===== 丙火日柱 (24-35) =====
  24: { poetry:"丙子日生，涧下水音。旭日东升，照临大海。水火既济之象。", personality:"光明磊落，热情洋溢。丙火为太阳之光，子水为智慧之源，智勇双全。", career:"宜从事政治、企业高管、能源、文化等行业。", relationships:"子为桃花，感情热烈。水火相济，婚姻可成互补。", ganZhiRelation:"丙火坐子水正官，官星得位。水火交融，以礼自持。", naYinMeaning:"涧下水——山涧清流，映日光华。水火既济，大吉之象。", luckyElements:["Wood","Fire"] },
  25: { poetry:"丙寅日生，炉中火音。旭日东升，寅为火长生之地。朝气蓬勃之格。", personality:"朝气蓬勃，活力四射。寅为丙火长生，又为偏印，聪明有学识。", career:"宜从政、教育、科技、能源等朝阳行业。", relationships:"寅为红艳，感情热烈主动。配偶宜温柔包容。", ganZhiRelation:"丙坐寅木偏印。寅藏甲丙戊，偏印、比肩、食神同宫。印比相生。", naYinMeaning:"炉中火——炉火燃烧，温暖热烈。火旺需水调剂，防过刚。", luckyElements:["Water","Earth"] },
  26: { poetry:"丙辰日生，沙中土音。太阳照龙庭，辰为水库。火土相生，龙守财库。", personality:"稳重有心计，善于理财。辰为水库，丙火照之，智慧通达。", career:"宜从事金融、管理、咨询、仓储等行业。", relationships:"辰为华盖，性格偏孤。婚姻宜水旺者调和。", ganZhiRelation:"丙坐辰土食神，辰藏乙戊癸。正印、食神、正官齐备，格局贵气。", naYinMeaning:"沙中土——沙土含金，内蕴宝藏。以火炼金，财运可期。", luckyElements:["Wood","Fire"] },
  27: { poetry:"丙午日生，天河水音。日正中天，光芒万丈。午为丙帝旺之地。", personality:"光芒四射，领导风范。羊刃坐身，性格刚烈，自信满满。", career:"宜从政、演艺、体育、创业等需光芒与魄力之业。", relationships:"午为桃花加羊刃，感情激烈。需克制冲动以利婚姻。", ganZhiRelation:"丙坐午火劫财羊刃。午藏丁己，火旺极盛。需水调候，否则过刚。", naYinMeaning:"天河水——天河之水，高处不胜寒。光芒过盛需水润泽。", luckyElements:["Water","Earth"] },
  28: { poetry:"丙申日生，山下火音。火炼真金。丙坐申金偏财，财星得位。", personality:"善于理财，有商业头脑。申为驿马，好动不居，宜外出发展。", career:"宜从商、贸易、旅游、金融等流动性行业。", relationships:"申为驿马，感情有异地缘。配偶宜稳重顾家者。", ganZhiRelation:"丙坐申金偏财，申藏庚壬戊。财生杀，杀生印，格局连环。", naYinMeaning:"山下火——山麓之火，光照有限。需向外拓展方能大展宏图。", luckyElements:["Wood","Fire"] },
  29: { poetry:"丙戌日生，屋上土音。太阳落山，火归火库。戌为火库收藏火气。", personality:"成熟稳重，深藏不露。火气入库，外冷内热，实则精力充沛。", career:"宜从事地产、文化、收藏、管理等领域。", relationships:"戌为寡宿，感情需主动维系。宜开朗的配偶互补。", ganZhiRelation:"丙坐戌土食神，戌为火库。藏戊辛丁，食神、正财、劫财同宫。", naYinMeaning:"屋上土——屋上之土，高而不危。火土相生，根基稳固。", luckyElements:["Wood","Water"] },
  30: { poetry:"丙子日生，涧下水音。旭日映海，水光接天。天乙贵人加临。", personality:"阳光开朗，智慧过人。水火既济之格，既有热情又有理智。", career:"宜从事外交、文化、教育、传媒等需智商情商之业。", relationships:"天乙贵人入命，婚姻有贵人相助。配偶有德有才。", ganZhiRelation:"丙坐子水正官，天乙贵人。官星清透，为人正直有礼。" , naYinMeaning:"涧下水——山水相映，美不胜收。水火交融，大吉之配。", luckyElements:["Wood","Fire"] },
  31: { poetry:"丙寅日生，炉中火音。丙临寅位，三阳开泰。长生之地，朝气蓬勃。", personality:"如日初升，前途无量。性格开朗，乐善好施，有领袖气质。", career:"宜从政、公益、教育、医疗等光明的行业。", relationships:"寅中丙火比肩助身，感情主动。配偶宜水木旺者。", ganZhiRelation:"丙坐寅偏印长生。寅藏甲丙戊，印、比、食三奇汇聚。" , naYinMeaning:"炉中火——炉火纯青，技艺精湛。宜专攻一技之长。", luckyElements:["Water","Earth"] },
  32: { poetry:"丙辰日生，沙中土音。龙行雨施，日照龙庭。食神生财，格局清贵。", personality:"才智过人，善于经营。食神旺相，为人慷慨大方，享受生活。", career:"宜从事餐饮、娱乐、艺术、旅游等享受型行业。", relationships:"辰中乙木正印，感情有分寸。宜活泼开朗的配偶。", ganZhiRelation:"丙坐辰食神，辰藏乙戊癸。正印、食神、正官汇聚，贵气自生。", naYinMeaning:"沙中土——沙中含金，土生金财。食神生财，财运可期。", luckyElements:["Wood","Fire"] },
  33: { poetry:"丙午日生，天河水音。烈日中天，骄阳似火。羊刃帝旺，火气冲天。", personality:"热情奔放到极致。有王者之气，但需防刚愎自用，骄傲自满。", career:"宜从事演艺、体育、军事、创业等需极强表现力之业。", relationships:"午火桃花羊刃同宫，感情热烈但易冲动。宜稳重的配偶。", ganZhiRelation:"丙坐午帝旺羊刃。午藏丁己，火势滔天。需水济之，否则过犹不及。", naYinMeaning:"天河水——天河之水，可济烈火。以柔克刚的智慧。", luckyElements:["Water","Metal"] },
  34: { poetry:"丙申日生，山下火音。金猴戏火，机变无穷。偏财坐驿马，动中求财。", personality:"机智灵活，善于应变。财运亨通但来去较快，宜动不宜静。", career:"宜从事贸易、物流、交通、销售等流动性行业。", relationships:"申为驿马，配偶可能异地人。宜各自独立空间。", ganZhiRelation:"丙坐申偏财，申藏庚壬戊。财生杀，杀生印，连环相生。" , naYinMeaning:"山下火——山下之火，需登高望远。拓展视野方能大展。", luckyElements:["Wood","Fire"] },
  35: { poetry:"丙戌日生，屋上土音。日暮西山，火归火库。火土相生，晚景荣昌。", personality:"老成持重，后发制人。前半生积累，后半生突破，大器晚成。", career:"宜长期规划的事业，如地产、文化、教育等。", relationships:"戌为寡宿，感情偏晚。宜水木旺之配偶调和燥气。", ganZhiRelation:"丙坐戌食神火库。戌藏戊辛丁，食神生财，财旺身强。" , naYinMeaning:"屋上土——居高临下，一览众山。晚年运佳，福泽绵长。", luckyElements:["Water","Wood"] },

  // ===== 丁火日柱 (36-47) =====
  36: { poetry:"丁丑日生，涧下水音。灯火映雪，外冷内热。丑为金库，财官有库。", personality:"外表沉静，内心炽热。如灯中之火，不张扬但持久温暖。", career:"宜从事文学、艺术、研究、手工艺等静中求成之业。", relationships:"丑中藏辛金偏财，配偶有财。婚姻稳定但少浪漫。", ganZhiRelation:"丁坐丑土食神，丑为金库。藏己癸辛，食神、七杀、偏财同宫。" , naYinMeaning:"涧下水——山涧清流，映火生辉。水火相映，格局秀美。", luckyElements:["Wood","Fire"] },
  37: { poetry:"丁卯日生，炉中火音。灯花报喜，木火通明。卯为偏印，聪明灵秀。", personality:"温文尔雅，聪明灵秀。偏印旺相，有特殊才艺，思维独特。", career:"宜从事设计、艺术、心理咨询、玄学等独特行业。", relationships:"卯为桃花，感情浪漫温馨。宜有共同精神追求的配偶。", ganZhiRelation:"丁坐卯木偏印，卯藏乙木。偏印独旺，才华专精，但防孤僻。" , naYinMeaning:"炉中火——炉火温和，持久不灭。温和而坚韧的性格。", luckyElements:["Earth","Fire"] },
  38: { poetry:"丁巳日生，沙中土音。灯火通明，巳为帝旺。火土相生，光芒四射。", personality:"热情主动，行动力强。帝旺之地，自信满满，感染力强。", career:"宜从事演艺、传媒、市场、公关等需表现力之业。", relationships:"巳为红艳，感情丰富多彩。桃花旺需慎选良缘。", ganZhiRelation:"丁坐巳火劫财帝旺。巳藏丙戊庚，劫财、伤官、正财同宫。格局复杂。", naYinMeaning:"沙中土——沙土藏金，以火炼之。才华如火，可炼真金。", luckyElements:["Water","Metal"] },
  39: { poetry:"丁未日生，天河水音。灯烛幽微，未为木库。食神生财，温润如玉。", personality:"温和有礼，善于合作。食神旺相，为人厚道，乐于分享。", career:"宜从事服务、教育、餐饮、文化等行业。", relationships:"未为寡宿，感情内敛。宜主动表达，防独身倾向。", ganZhiRelation:"丁坐未土食神，未藏己丁乙。食神、比肩、偏印汇聚。", naYinMeaning:"天河水——天河之水，高处不胜寒。需接地气，脚踏实地。", luckyElements:["Wood","Fire"] },
  40: { poetry:"丁酉日生，山下火音。灯火照金，金碧辉煌。酉为偏财，财星得位。", personality:"善于理财，精明能干。酉为桃花加文昌，才貌双全。", career:"宜从事金融、艺术、珠宝、奢侈品等行业。", relationships:"酉为桃花，异性缘佳。文昌入命，配偶有学识。", ganZhiRelation:"丁坐酉金偏财，酉藏辛金。偏财独旺，财运亨通但需防投机。" , naYinMeaning:"山下火——山麓灯火，照亮前路。光明在前，勇往直前。", luckyElements:["Wood","Earth"] },
  41: { poetry:"丁亥日生，屋上土音。灯火照水，水火既济。亥中正官正印，贵人双临。", personality:"德才兼备，外柔内刚。天乙贵人加临，一生有贵人帮扶。", career:"宜从政、教育、公益、文化等公共事业。", relationships:"亥为桃花加天乙，婚姻美满。配偶有德有地位。", ganZhiRelation:"丁坐亥水正官，亥藏壬甲。正官+正印，官印相生，贵格。" , naYinMeaning:"屋上土——高处之土，根基稳固。官印相生，步步高升。", luckyElements:["Wood","Fire"] },
  42: { poetry:"丁丑日生，涧下水音。烛火映雪，孤芳自赏。湿土晦火，才华难展。", personality:"怀才不遇，内心炽热而外表淡然。需外力点燃热情。", career:"宜择温暖向阳之环境，避开压抑沉闷的氛围。", relationships:"丑为华盖，性格偏孤僻。宜阳光开朗的配偶互补。", ganZhiRelation:"丁坐丑湿土，土重火晦。需木疏土，木生火，方能舒展。", naYinMeaning:"涧下水——水冷涧幽，火微不显。需待时机方能发光。", luckyElements:["Wood","Fire"] },
  43: { poetry:"丁卯日生，炉中火音。春灯照耀，花开富贵。偏印生身，聪明绝顶。", personality:"聪明绝顶，才华出众。偏印旺而有制，既聪明又不孤僻。", career:"宜从事高精尖技术、科研、设计、艺术等需天赋之业。", relationships:"卯为桃花，文人雅士之恋。宜有精神共鸣的配偶。", ganZhiRelation:"丁坐卯偏印，卯藏乙木。偏印专旺，才华精纯而深入。" , naYinMeaning:"炉中火——火在炉中，温暖而不烈。才华温和而持久。", luckyElements:["Earth","Fire"] },
  44: { poetry:"丁巳日生，沙中土音。灯烛辉煌，火蛇吐信。帝旺之地，精力旺盛。", personality:"精力充沛，才华横溢。但劫财帝旺，防争强好胜导致人际紧张。", career:"宜充分发挥才华的行业，但需团队合作而非单打独斗。", relationships:"巳为红艳加劫财，感情竞争多。宜专一专注。", ganZhiRelation:"丁坐巳帝旺劫财。巳藏丙戊庚，火旺需水济，否则过犹不及。", naYinMeaning:"沙中土——沙土藏金待火炼。精力需聚焦方能有成。", luckyElements:["Water","Metal"] },
  45: { poetry:"丁未日生，天河水音。灯火微茫，未为木火库。食神泄秀，温润平和。", personality:"温润平和，与世无争。食神旺相，善于体谅他人，人缘好。", career:"宜从事服务、咨询、教育、医疗等助人行业。", relationships:"感情温和但偏被动。未为寡宿，宜主动经营。", ganZhiRelation:"丁坐未土食神，未藏己丁乙。食神生财，宜稳扎稳打。", naYinMeaning:"天河水——天河之水润泽万物。以柔克刚的智慧。", luckyElements:["Wood","Metal"] },
  46: { poetry:"丁酉日生，山下火音。金灯相照，才财双全。偏财坐桃花，风流倜傥。", personality:"风流倜傥，才财兼备。桃花加文昌，才貌出众，异性缘旺。", career:"宜从事艺术、金融、娱乐、时尚等行业。", relationships:"桃花旺，异性缘佳。但需防滥情，择一而终。", ganZhiRelation:"丁坐酉偏财桃花。酉藏辛金独财，财旺需身强方能担之。", naYinMeaning:"山下火——灯火在山下，需向上攀登。努力上进方得财。", luckyElements:["Wood","Fire"] },
  47: { poetry:"丁亥日生，屋上土音。灯火临水，照见天门。官印双清，贵气自生。", personality:"清贵之格，德才兼备。官印相生，既有地位又有学识。", career:"宜从政、学术、文化、公益等需德才兼备之业。", relationships:"亥中壬甲官印，配偶有德有才。天乙贵人加持。", ganZhiRelation:"丁坐亥正官，亥藏壬甲。官印相生，贵人临身，上等吉格。", naYinMeaning:"屋上土——居高处之土，根基深厚。官印相生，步步高升。", luckyElements:["Wood","Fire"] },

  // ===== 戊土日柱 (48-59) =====
  48: { poetry:"戊子日生，霹雳火音。山环水抱。戊坐子水正财，财星得位。", personality:"稳重踏实，善于理财。如高山临水，刚柔并济，诚信可靠。", career:"宜从商、金融、地产、管理等领域。", relationships:"子为桃花，感情美满。正财坐妻宫，婚姻稳定。", ganZhiRelation:"戊土坐子水正财。子水财星清透，身旺则能担财。", naYinMeaning:"霹雳火——雷电之火，惊天动地。厚积薄发，一鸣惊人。", luckyElements:["Fire","Earth"] },
  49: { poetry:"戊寅日生，城头土音。虎踞山林。寅为七杀，杀印相生，有胆有识。", personality:"胆识过人，魄力十足。戊土厚重坐寅木七杀，威严而有魄力。", career:"宜从政、军警、企业管理等需权威魄力之业。", relationships:"寅为红艳，感情热烈。七杀为夫星，配偶能力强。", ganZhiRelation:"戊坐寅木七杀。寅藏甲丙戊，杀印比同宫，杀印相生格局。" , naYinMeaning:"城头土——城墙之土，固若金汤。根基深厚，不可动摇。", luckyElements:["Fire","Earth"] },
  50: { poetry:"戊辰日生，大林木音。龙盘厚土。辰为水库财库，龙守财库。", personality:"心胸宽广，稳重踏实。辰为水库润土，既有原则又灵活。", career:"宜从事地产、金融、水利、仓储等行业。", relationships:"辰为华盖，性情独立。婚姻宜多沟通，防疏离。", ganZhiRelation:"戊坐辰土比肩，辰藏乙戊癸。正官、比肩、正财同宫。比肩助旺。", naYinMeaning:"大林木——森林之木，广阔繁茂。厚德载物，包容万象。", luckyElements:["Fire","Metal"] },
  51: { poetry:"戊午日生，路旁土音。炎土烈日。羊刃帝旺，火土相生，精力旺盛。", personality:"精力旺盛，意志坚定。午为羊刃帝旺，性格刚烈，宁折不弯。", career:"宜从事军事、体育、竞技、创业等需意志力之业。", relationships:"午为桃花加羊刃，感情激烈。宜水木旺之配偶调和。", ganZhiRelation:"戊坐午火正印羊刃。午藏丁己，火炎土燥。需水润局。", naYinMeaning:"路旁土——路旁之土，车马碾压。历经磨难方成器。", luckyElements:["Water","Metal"] },
  52: { poetry:"戊申日生，剑锋金音。金石为开。申为食神，食神生财，聪明机智。", personality:"聪明机智，善于变通。食神旺相，有口福有人缘，善于交际。", career:"宜从事贸易、旅游、餐饮、顾问等需交际之业。", relationships:"申为驿马，感情易有异地缘。宜稳重顾家的配偶互补。", ganZhiRelation:"戊坐申金食神，申藏庚壬戊。食神生偏财，财又生比肩。", naYinMeaning:"剑锋金——剑锋之金，锋芒毕露。才华如剑，需善用。", luckyElements:["Fire","Earth"] },
  53: { poetry:"戊戌日生，平地木音。厚土重重。戌为火库，魁罡入命，性格刚强。", personality:"刚强果断，说一不二。魁罡入命，有威严有魄力，但防刚愎。", career:"宜从军警、法律、管理、政治等权威领域。", relationships:"戌为寡宿加魁罡，感情需柔性调和。宜温柔体贴的配偶。", ganZhiRelation:"戊坐戌土比肩火库，魁罡。戌藏辛丁戊，伤官、正印、比肩同宫。", naYinMeaning:"平地木——平地之木，脚踏实地。厚土载木，稳重求胜。", luckyElements:["Water","Wood"] },
  54: { poetry:"戊子日生，霹雳火音。高山流水，刚柔相济。正财得位，务实可靠。", personality:"务实可靠，善于经营。既有大山之稳重，又有流水之灵活。", career:"宜从事金融、贸易、地产等财富型行业。", relationships:"子水正财得位，婚姻稳定务实。宜浪漫的配偶增添情趣。", ganZhiRelation:"戊坐子正财，财星得位。子水润土，阴阳调和，格局平和。", naYinMeaning:"霹雳火——雷电之火，山中之光。厚积薄发，一鸣惊人。", luckyElements:["Fire","Earth"] },
  55: { poetry:"戊寅日生，城头土音。虎啸山林，威震四方。七杀为用，将才之格。", personality:"将才之格，统帅之才。七杀催贵，有担当有魄力，不惧困难。", career:"宜从军、政、商界领袖岗位，发挥统帅才能。", relationships:"寅中七杀为夫星，配偶能力强。但防强势相争。", ganZhiRelation:"戊坐寅七杀，寅藏甲丙戊。杀印相生，以德服人，以智化杀。" , naYinMeaning:"城头土——城墙之土，巍然屹立。以厚重载万物。", luckyElements:["Fire","Earth"] },
  56: { poetry:"戊辰日生，大林木音。龙潜深渊，待时而动。辰为水库，蓄势待发。", personality:"蓄势待发，胸有丘壑。外显平和，内有谋略，善于等待时机。", career:"宜从事战略规划、投资、研究等需长远眼光之业。", relationships:"辰中乙木正官，配偶有责任心。宜多加赞美鼓励。", ganZhiRelation:"戊坐辰比肩，辰藏乙戊癸。正官、比肩、正财，官星得位。", naYinMeaning:"大林木——木旺成林，根基深广。厚土育林，德泽四方。", luckyElements:["Fire","Metal"] },
  57: { poetry:"戊午日生，路旁土音。烈日灼土，燥气冲天。羊刃帝旺，火炎土燥。", personality:"热情似火，精力无穷。但火炎土燥，防性情急躁，做事过激。", career:"宜择水木行业以调和燥气，不宜过劳过急之业。", relationships:"午火桃花旺，感情激烈但易冲突。宜水旺之配偶调候。", ganZhiRelation:"戊坐午帝旺羊刃，午藏丁己。火炎土燥，需水调候为第一要务。", naYinMeaning:"路旁土——路旁燥土，需水滋润。调候为急，先求平衡。", luckyElements:["Water","Metal"] },
  58: { poetry:"戊申日生，剑锋金音。金石为开，玉振金声。食神吐秀，才艺出众。", personality:"才华出众，口才流利。食神旺相，善于表达，乐于分享。", career:"宜从事教育、演讲、写作、咨询等表达型行业。", relationships:"申为驿马，感情活跃。宜找能欣赏你才华的配偶。", ganZhiRelation:"戊坐申食神，申藏庚壬戊。食神生偏财，才华可转化为财富。", naYinMeaning:"剑锋金——剑锋之金，犀利无比。才华如剑，锋芒毕露。", luckyElements:["Fire","Earth"] },
  59: { poetry:"戊戌日生，平地木音。厚土载物，德配天地。魁罡入命，正气凛然。", personality:"正气凛然，刚正不阿。魁罡入命，为人正直，不畏强权。", career:"宜从事司法、监察、审计、管理等领域。", relationships:"魁罡入命，感情上需柔和包容。宜温柔体贴的配偶。", ganZhiRelation:"戊坐戌魁罡，戌藏辛丁戊。伤官、正印、比肩同宫，格局厚重。", naYinMeaning:"平地木——平地之木，根深叶茂。厚德载物，福泽绵长。", luckyElements:["Water","Wood"] },

  // ===== 己土日柱 (60-71) =====
  60: { poetry:"己丑日生，霹雳火音。田园润土。己坐丑比肩，土气厚重，根基稳固。", personality:"温和厚道，为人可靠。如田园之土，滋养万物而不争。", career:"宜从事农业、食品、服务、教育等滋养型行业。", relationships:"丑为华盖，性情偏内向。宜开朗活泼的配偶互补。", ganZhiRelation:"己坐丑比肩，丑藏己癸辛。比肩、偏财、食神同宫。土气厚重。", naYinMeaning:"霹雳火——火生土旺，震雷启蛰。以火暖土，生机无限。", luckyElements:["Fire","Wood"] },
  61: { poetry:"己卯日生，城头土音。田园逢春，花开富贵。卯为七杀，以柔克刚。", personality:"外柔内刚，善于应变。己土之柔坐卯木之刚，柔中带刚。", career:"宜从事公关、教育、文化、服务等需柔性智慧之业。", relationships:"卯为桃花，异性缘佳。七杀坐夫宫，配偶有魄力。", ganZhiRelation:"己坐卯木七杀，卯藏乙木。以柔土涵木，以柔克刚之格。", naYinMeaning:"城头土——城头之土，固若金汤。以柔承刚，坚不可摧。", luckyElements:["Fire","Earth"] },
  62: { poetry:"己巳日生，大林木音。田园向阳，光照大地。巳为正印，聪明仁厚。", personality:"聪明仁厚，心地善良。正印护身，学识修养俱佳。", career:"宜从事教育、文化、医疗、科研等文雅行业。", relationships:"巳为红艳，感情浪漫。正印护身，配偶如师如友。", ganZhiRelation:"己坐巳火正印，巳藏丙戊庚。印生比，比生伤，连环相生。", naYinMeaning:"大林木——木火相生，葱茏繁茂。印星得力，学而有成。", luckyElements:["Water","Metal"] },
  63: { poetry:"己未日生，路旁土音。田园沃土，丰收在望。未为比肩，土气更旺。", personality:"宽厚包容，乐于助人。土旺之人最讲信用，重承诺守本分。", career:"宜从事地产、农业、收藏、仓储等土性行业。", relationships:"未为寡宿，感情偏保守。宜主动打开心扉。", ganZhiRelation:"己坐未比肩，未藏己丁乙。比肩、偏印、七杀同宫。比肩独旺。", naYinMeaning:"路旁土——沿途之土，滋养行人。乐于助人，福报深厚。", luckyElements:["Wood","Metal"] },
  64: { poetry:"己酉日生，剑锋金音。田园产金。酉为食神，食神生财，聪明灵秀。", personality:"聪明灵秀，才华出众。食神旺相，善于表达，有艺术天分。", career:"宜从事艺术、设计、美食、娱乐等创意行业。", relationships:"酉为桃花，异性缘佳。食神坐夫宫，配偶有趣有才。", ganZhiRelation:"己坐酉金食神，酉藏辛金。食神独旺，才华精纯专一。", naYinMeaning:"剑锋金——剑锋之利，锋芒毕露。才华卓越，宜善加利用。", luckyElements:["Fire","Earth"] },
  65: { poetry:"己亥日生，平地木音。田园临水，泽润万物。亥为正财正官，福泽深厚。", personality:"福泽深厚，心地善良。财官双临，一生衣食无忧，平安顺遂。", career:"宜从商、管理、公共事业等稳定体面之业。", relationships:"亥为桃花，婚姻幸福美满。财官得位，配偶有才有德。", ganZhiRelation:"己坐亥水正财，亥藏壬甲。正财+正官，财官双美之格。" , naYinMeaning:"平地木——平地之木，脚踏实地。财官双美，稳步上升。", luckyElements:["Fire","Earth"] },
  66: { poetry:"己丑日生，霹雳火音。寒土冻田，需火暖局。湿土困身，才华难展。", personality:"内敛保守，慎言慎行。湿土过重，缺乏活力，需外力激励。", career:"宜择阳光积极之行业，避开沉闷单调之环境。", relationships:"丑为华盖，保守内向。宜阳光热情的配偶带动。", ganZhiRelation:"己坐丑湿土，丑藏己癸辛。土重水湿，需火暖局方能舒展。", naYinMeaning:"霹雳火——火震寒土，生机再现。调候为急，先求温暖。", luckyElements:["Fire","Wood"] },
  67: { poetry:"己卯日生，城头土音。春回大地，万物复苏。卯木疏土，生机盎然。", personality:"心思细腻，善解人意。卯木疏土，既有土的包容又有木的灵动。", career:"宜从事心理咨询、教育、园艺、设计等精细行业。", relationships:"卯为桃花，多情浪漫。宜稳重可靠的配偶互补。", ganZhiRelation:"己坐卯七杀，卯藏乙木。七杀疏土，以柔克刚，格局秀气。", naYinMeaning:"城头土——城头之土，俯视众生。刚柔并济，进退有度。", luckyElements:["Fire","Earth"] },
  68: { poetry:"己巳日生，大林木音。暖土育木，生机蓬勃。正印得力，聪明好学。", personality:"聪明好学，知识渊博。正印旺相，记忆力强，学以致用。", career:"宜从事学术、研究、教育、出版等知识密集型行业。", relationships:"巳为红艳，感情丰富。正印护身，配偶如良师益友。", ganZhiRelation:"己坐巳正印，巳藏丙戊庚。印生比，比生伤，相生有情。", naYinMeaning:"大林木——林木葱茏，生机盎然。印星有力，学而优则仕。", luckyElements:["Water","Metal"] },
  69: { poetry:"己未日生，路旁土音。沃土千里，丰收在即。土重为患，需木疏之。", personality:"敦厚老实，踏实本分。土重之人最讲信用，但防固执不化。", career:"宜从事农业、建筑、地产、仓储等实业。", relationships:"未为寡宿，感情被动。宜主动出击，打开心扉。", ganZhiRelation:"己坐未比肩，未藏己丁乙。土气过重，需木疏土，金泄土。", naYinMeaning:"路旁土——路旁之土，任人践踏。以德报怨，福泽深厚。", luckyElements:["Wood","Metal"] },
  70: { poetry:"己酉日生，剑锋金音。田园藏金，内秀其中。食神吐秀，才艺超群。", personality:"才艺超群，心灵手巧。食神旺相，有独到品味和审美。", career:"宜从事手工艺、设计、美食、艺术等精致行业。", relationships:"酉为桃花文昌，才貌双全。配偶宜有共同兴趣爱好。", ganZhiRelation:"己坐酉食神，酉藏辛金。食神独旺，精于一艺，可成大器。", naYinMeaning:"剑锋金——剑锋之利，无坚不摧。专精一艺，可达巅峰。", luckyElements:["Fire","Earth"] },
  71: { poetry:"己亥日生，平地木音。田园泽润，水木清华。财官双美，福禄双全。", personality:"福禄双全，安享人生。财官得位，既有财富又有地位。", career:"宜从政、商、文化等体面安稳之业。", relationships:"亥为桃花，婚姻幸福。财官双美，家庭美满。", ganZhiRelation:"己坐亥正财，亥藏壬甲。正财+正官，夫星得位，妻星得力。", naYinMeaning:"平地木——平地之木，稳健生长。财官双美，步步高升。", luckyElements:["Fire","Earth"] },

  // ===== 庚金日柱 (72-83) =====
  72: { poetry:"庚子日生，壁上土音。金沉水底。子为伤官，伤官泻秀，聪明机智。", personality:"聪明机智，反应灵敏。伤官旺相，有创意，口才出众。", career:"宜从事技术、设计、咨询、贸易等需智谋之业。", relationships:"子为桃花，异性缘佳。伤官坐夫宫，配偶宜包容者。", ganZhiRelation:"庚坐子水伤官，子藏癸水。伤官独旺，才华飘溢，需印制。", naYinMeaning:"壁上土——壁上之土，金在水中。以土制水方能显金。", luckyElements:["Earth","Metal"] },
  73: { poetry:"庚寅日生，金箔金音。金雕虎踞。寅为偏财，坐偏财星，财运亨通。", personality:"有胆有识，善于经营。偏财坐身，商业头脑发达。", career:"宜从商、投资、贸易、创业等财富型行业。", relationships:"寅为红艳，感情热烈。偏财为父为妻，配偶有助财运。", ganZhiRelation:"庚坐寅木偏财，寅藏甲丙戊。偏财、七杀、偏印同宫。财杀印连环。", naYinMeaning:"金箔金——金箔之金，薄而珍贵。以少胜多，以质取胜。", luckyElements:["Earth","Metal"] },
  74: { poetry:"庚辰日生，白蜡金音。金龙盘踞。辰为偏印，魁罡入命，刚正不阿。", personality:"刚正不阿，一身正气。魁罡入命，性格刚强，有威严。", career:"宜从军警、司法、管理、政治等权威领域。", relationships:"辰为华盖，性情独立。魁罡入命，感情需柔性调和。", ganZhiRelation:"庚坐辰土偏印，辰藏乙戊癸。正财、偏印、伤官同宫。格局厚重。", naYinMeaning:"白蜡金——白蜡之金，温润内敛。刚中有柔，大器晚成。", luckyElements:["Earth","Fire"] },
  75: { poetry:"庚午日生，杨柳木音。金被火炼。午为正官，官星得位，贵气自生。", personality:"正直有原则，官星照命。有责任感，组织能力强。", career:"宜从政、管理、法律、公共事业等正途。", relationships:"午为桃花加正官，配偶有社会地位。婚姻正式庄重。", ganZhiRelation:"庚坐午火正官，午藏丁己。官印相生，正官清透，贵格。", naYinMeaning:"杨柳木——杨柳之木，柔韧有力。以柔承刚，富贵双全。", luckyElements:["Earth","Metal"] },
  76: { poetry:"庚申日生，泉中水音。金猴献瑞。申为比肩禄神，自身强旺。", personality:"独立自主，意志坚定。禄神坐身，精力充沛，行动力强。", career:"宜创业、管理、技术等需独立自主之业。", relationships:"申为驿马，感情有异地缘。比肩坐夫宫，配偶独立。", ganZhiRelation:"庚坐申比肩禄神，申藏庚壬戊。比肩、食神、偏印同宫。自身强旺。", naYinMeaning:"泉中水——泉水叮咚，源源不断。禄神旺相，运势绵长。", luckyElements:["Water","Fire"] },
  77: { poetry:"庚戌日生，钗钏金音。金埋火库。戌为偏印火库，魁罡入命。", personality:"刚毅果断，有魄力。魁罡入命，为人正直，但防固执。", career:"宜从事军警、法律、技术等需专注力之业。", relationships:"戌为寡宿加魁罡，感情需主动经营。宜温柔配偶。", ganZhiRelation:"庚坐戌土偏印，戌藏辛丁戊。劫财、正官、偏印同宫。魁罡之格。", naYinMeaning:"钗钏金——钗钏之金，精美绝伦。刚中带柔，品质卓越。", luckyElements:["Water","Wood"] },
  78: { poetry:"庚子日生，壁上土音。金沉深渊，需土制水。伤官泻秀过重。", personality:"聪明过度，反被聪明误。伤官太旺，思虑过多，需脚踏实地。", career:"宜择土金之业以制水，如建筑、制造等实业。", relationships:"桃花伤官同宫，感情多变。宜稳重成熟的配偶。", ganZhiRelation:"庚坐子伤官，子水独旺。伤官太重，需印星制之。", naYinMeaning:"壁上土——壁上之土，金在水中。需土制水方能显金。", luckyElements:["Earth","Metal"] },
  79: { poetry:"庚寅日生，金箔金音。金雕玉琢，巧夺天工。偏财坐马，动中求财。", personality:"精明能干，善于把握机会。商业直觉敏锐，宜经商贸易。", career:"宜从商、投资、贸易、中介等变现能力强的行业。", relationships:"寅为红艳驿马，感情活跃多变。宜找稳定型的配偶。", ganZhiRelation:"庚坐寅偏财，寅藏甲丙戊。财生杀，杀生印，连环相生。", naYinMeaning:"金箔金——金箔之薄，价值不菲。以智取胜，以小博大。", luckyElements:["Earth","Metal"] },
  80: { poetry:"庚辰日生，白蜡金音。金龙在渊，蓄势待发。魁罡坐命，正气凛然。", personality:"正气凛然，有领导风范。魁罡入命，不怒自威。", career:"宜从政、军、法、管理等需正气之业。", relationships:"辰中乙木正财，配偶温婉有德。魁罡宜柔性调和。", ganZhiRelation:"庚坐辰偏印魁罡，辰藏乙戊癸。正财、偏印、伤官汇聚。", naYinMeaning:"白蜡金——白蜡之金，温润而泽。刚毅中有柔情。", luckyElements:["Earth","Fire"] },
  81: { poetry:"庚午日生，杨柳木音。金鸣玉振，炉火纯青。正官得位，贵气自生。", personality:"正直有担当，守规矩重原则。正官清透，有社会地位。", career:"宜从政、公务员、法律、管理等正途。", relationships:"午为正官桃花，配偶有社会地位。宜门当户对。", ganZhiRelation:"庚坐午正官，午藏丁己。正官+正印，官印相生，贵格。", naYinMeaning:"杨柳木——杨柳之柔，金之刚，刚柔并济。富贵双全。", luckyElements:["Earth","Metal"] },
  82: { poetry:"庚申日生，泉中水音。金猴独立，特立独行。禄神坐身，自信满满。", personality:"自信满满，独立自强。禄神旺相，精力充沛，不畏挑战。", career:"宜创业、技术、专业性强的工作领域。", relationships:"申为驿马，独立性强。宜能理解包容的配偶。", ganZhiRelation:"庚坐申禄神，申藏庚壬戊。比肩、食神、偏印同宫。自身强旺之格。", naYinMeaning:"泉中水——泉水之源，生生不息。禄神旺，运势不衰。", luckyElements:["Water","Fire"] },
  83: { poetry:"庚戌日生，钗钏金音。金藏火库，待炼成器。魁罡之格，以刚制刚。", personality:"刚毅不拔，愈挫愈勇。魁罡入命，不畏艰险，迎难而上。", career:"宜从事军警、消防、危机管理等挑战型行业。", relationships:"戌为寡宿，感情晚成。宜温柔体贴者互补。", ganZhiRelation:"庚坐戌偏印火库魁罡，戌藏辛丁戊。劫财、正官、偏印同宫。", naYinMeaning:"钗钏金——钗钏之金，精工细作。刚中有细，大器可成。", luckyElements:["Water","Wood"] },

  // ===== 辛金日柱 (84-95) =====
  84: { poetry:"辛丑日生，壁上土音。金入金库。丑为偏印金库，金气内敛。", personality:"内敛深沉，心思缜密。如珠宝藏匣，不轻易展示真实自我。", career:"宜从事珠宝、金融、收藏、研究等精细行业。", relationships:"丑为华盖，性格偏内向。宜开朗的配偶打破沉闷。", ganZhiRelation:"辛坐丑土偏印，丑藏己癸辛。偏印、食神、比肩同宫。金库自藏。", naYinMeaning:"壁上土——壁上之土，内藏珍宝。外朴内秀，厚积薄发。", luckyElements:["Water","Wood"] },
  85: { poetry:"辛卯日生，金箔金音。金雕玉叶。卯为偏财，财星临桃花，才貌双全。", personality:"才貌双全，风流倜傥。偏财桃花同宫，异性缘旺，善于交际。", career:"宜从事艺术、时尚、娱乐、销售等人际密集型行业。", relationships:"桃花旺，感情机会多。但需防烂桃花，择良缘而栖。", ganZhiRelation:"辛坐卯木偏财，卯藏乙木。偏财独旺，财运虽佳但易浮动。", naYinMeaning:"金箔金——薄金饰木，精致华美。以精致取胜，宜精细行业。", luckyElements:["Earth","Metal"] },
  86: { poetry:"辛巳日生，白蜡金音。金蛇吐信。巳为正官，正官得位，贵气自生。", personality:"正直有原则，做事有条理。正官临身，有责任感，值得信赖。", career:"宜从政、管理、法律、医疗等正经行业。", relationships:"巳为红艳加正官，感情正式端庄。配偶有社会地位。", ganZhiRelation:"辛坐巳火正官，巳藏丙戊庚。正官、正印、劫财同宫。官印相生。", naYinMeaning:"白蜡金——白蜡之金，温润有光。正官清贵，仕途可期。", luckyElements:["Earth","Metal"] },
  87: { poetry:"辛未日生，杨柳木音。金埋土中。未为偏印，土重金埋，需木疏土。", personality:"朴实无华，低调做人。土重埋金，才华不显，需外力发掘。", career:"宜从事实业、制造、农业等脚踏实地之业。", relationships:"未为寡宿，感情被动单纯。宜主动热情者带动。", ganZhiRelation:"辛坐未土偏印，未藏己丁乙。偏印、七杀、偏财同宫。土重需木疏。", naYinMeaning:"杨柳木——杨柳之木可疏土。以木疏土方能显金之光。", luckyElements:["Wood","Water"] },
  88: { poetry:"辛酉日生，泉中水音。金鸡独立。酉为比肩禄神，自身强旺。", personality:"独立自信，个性鲜明。禄神坐身，有主见，不轻易随波逐流。", career:"宜从事技术、艺术、专业性强的工作。", relationships:"酉为桃花加文昌，才貌双全。宜有共同价值观的配偶。", ganZhiRelation:"辛坐酉禄神，酉藏辛金独比。金气纯粹，禄神自旺，精气神足。", naYinMeaning:"泉中水——泉水之清，映金之纯。禄神旺相，品质卓越。", luckyElements:["Water","Fire"] },
  89: { poetry:"辛亥日生，钗钏金音。金水相涵。亥为伤官，伤官泻秀，聪明灵秀。", personality:"聪明灵秀，心地善良。伤官有制（亥中壬甲），才智与德行兼备。", career:"宜从事艺术、设计、教育、咨询等创意型行业。", relationships:"亥为桃花，感情浪漫。伤官坐夫宫，配偶有才华。", ganZhiRelation:"辛坐亥水伤官，亥藏壬甲。伤官生财，财又生官，连环相生。", naYinMeaning:"钗钏金——钗钏之精美。才华如金饰，璀璨夺目。", luckyElements:["Earth","Metal"] },
  90: { poetry:"辛丑日生，壁上土音。金藏土中，内秀深藏。金库自守，不外张扬。", personality:"内秀深藏，不喜张扬。金库自守，实力雄厚但不轻易展露。", career:"宜从事研究、技术、收藏等静心钻研之业。", relationships:"丑为华盖，内敛寡言。宜活泼开朗的配偶带动。", ganZhiRelation:"辛坐丑金库，丑藏己癸辛。偏印、食神、比肩同宫。自坐金库。", naYinMeaning:"壁上土——壁上之土，金在其中。默默耕耘，终有出头日。", luckyElements:["Wood","Water"] },
  91: { poetry:"辛卯日生，金箔金音。金枝玉叶，精致绝伦。偏财桃花，风流才子。", personality:"风流才子，精致优雅。偏财生财有道，桃花旺而会经营感情。", career:"宜从事时尚、艺术、奢侈品、娱乐等行业。", relationships:"桃花加偏财，异性缘极旺。需修炼定力，择一而终。", ganZhiRelation:"辛坐卯偏财桃花，卯藏乙木。偏财独旺，擅理财但易投机。", naYinMeaning:"金箔金——金箔之薄，精美绝伦。以精致取胜的人生。", luckyElements:["Earth","Metal"] },
  92: { poetry:"辛巳日生，白蜡金音。金蛇化龙，贵气暗藏。正官得位，步步高升。", personality:"步步为营，稳扎稳打。正官清透，守规矩有原则。", career:"宜从政、公务员、国企、事业单位等体制内。", relationships:"巳为正官红艳，感情正式而浪漫。配偶宜稳重可靠。", ganZhiRelation:"辛坐巳正官，巳藏丙戊庚。正官、正印、劫财同宫。官印相生。", naYinMeaning:"白蜡金——白蜡温润，金属光泽。官印相生，仕途光明。", luckyElements:["Earth","Metal"] },
  93: { poetry:"辛未日生，杨柳木音。金埋土中，待木疏之。土重为忌，需外力帮。", personality:"朴实低调，踏踏实实。土重之人重承诺，但防思维僵化。", career:"宜实业、制造、农业等传统行业。", relationships:"未为寡宿，感情单纯但被动。宜阳光积极的配偶。", ganZhiRelation:"辛坐未偏印，未藏己丁乙。土重金埋，需木来疏土。", naYinMeaning:"杨柳木——杨柳柔韧，可疏厚土。借木之力方能显金。", luckyElements:["Wood","Water"] },
  94: { poetry:"辛酉日生，泉中水音。金鸡报晓，一鸣惊人。禄神坐命，精气充沛。", personality:"精力充沛，自信满满。禄神旺相，做事干脆利落。", career:"宜技术、管理、创业等需独立决策之业。", relationships:"酉为桃花，异性缘佳。但比肩禄旺，防自我中心。", ganZhiRelation:"辛坐酉禄神，酉藏辛金独比。金气精纯，禄神独旺，专注力强。", naYinMeaning:"泉中水——泉水清冽，金在水中。金水相涵，秀气外发。", luckyElements:["Water","Fire"] },
  95: { poetry:"辛亥日生，钗钏金音。金水相逢，秀气生发。伤官有制，才智并茂。", personality:"才智并茂，心地善良。秀气外发而不张扬，有内在光芒。", career:"宜从事教育、艺术、文化、公益等事业。", relationships:"亥为桃花加天乙，婚姻有贵人。感情温馨美满。", ganZhiRelation:"辛坐亥伤官，亥藏壬甲。伤官生财，天乙贵人临身，上格。", naYinMeaning:"钗钏金——钗钏之精美。才华横溢而内敛，秀外慧中。", luckyElements:["Earth","Metal"] },

  // ===== 壬水日柱 (96-107) =====
  96: { poetry:"壬子日生，桑柘木音。汪洋大海，水势滔天。子为帝旺羊刃，水旺之极。", personality:"格局宏大，气度不凡。水势滔天，有包容万物之胸怀。", career:"宜从事航运、贸易、旅游、传媒等水属性行业。", relationships:"子为桃花加羊刃，感情如潮水。宜土旺配偶筑堤。", ganZhiRelation:"壬坐子帝旺羊刃，子藏癸水。水势浩大，需土制方成江河。", naYinMeaning:"桑柘木——桑柘之木可以养蚕。以木疏水，化水生财。", luckyElements:["Earth","Wood"] },
  97: { poetry:"壬寅日生，大溪水音。江河汇海，虎啸龙吟。寅为食神，食神生财。", personality:"才华横溢，气度恢宏。食神生财，既有才华又能转化财富。", career:"宜从事创意、艺术、咨询、贸易等食神生财之业。", relationships:"寅为红艳，感情丰富。食神坐夫宫，配偶有趣有才。", ganZhiRelation:"壬坐寅木食神，寅藏甲丙戊。食神生偏财，财又生七杀。连环相生。", naYinMeaning:"大溪水——溪流奔涌，汇入江河。水木相生，运势宽广。", luckyElements:["Earth","Metal"] },
  98: { poetry:"壬辰日生，沙中土音。龙潜深渊。辰为水库七杀，魁罡入命，威震四方。", personality:"威严有魄力，统帅之才。魁罡坐命，气场强大，不怒自威。", career:"宜从政、军警、企业高管等领导岗位。", relationships:"辰为华盖，性情独立。魁罡入命，感情需柔性调和。", ganZhiRelation:"壬坐辰七杀水库，辰藏乙戊癸。伤官、七杀、劫财同宫。魁罡格。", naYinMeaning:"沙中土——沙中藏金，以水淘之。魁罡之格，以刚制刚。", luckyElements:["Earth","Wood"] },
  99: { poetry:"壬午日生，天上火音。水火既济。午为正财正官，财官双美，贵格。", personality:"才华与品德兼备。财官双美，既有财运又有社会地位。", career:"宜从政、商、文化等体面行业。", relationships:"午为桃花加正官，配偶有社会地位。婚姻正式美满。", ganZhiRelation:"壬坐午火正财，午藏丁己。正财+正官，财官双美，贵气自生。", naYinMeaning:"天上火——天上之火，光明照耀。水火既济，大吉之格。", luckyElements:["Earth","Metal"] },
  100: { poetry:"壬申日生，石榴木音。金水相生。申为偏印禄神，聪明智慧，学识渊博。", personality:"聪明智慧，学识渊博。偏印旺相，悟性极高，有学术天赋。", career:"宜从事学术、科研、教育、技术等知识密集型行业。", relationships:"申为驿马，感情有异地缘。偏印坐夫宫，配偶聪慧。", ganZhiRelation:"壬坐申偏印禄神，申藏庚壬戊。偏印、比肩、七杀同宫。杀印相生。", naYinMeaning:"石榴木——石榴多子，金水相涵。学识渊博，桃李满天下。", luckyElements:["Wood","Fire"] },
  101: { poetry:"壬戌日生，大海水音。汪洋大海，气吞山河。戌为七杀火库，杀印相生。", personality:"气魄宏大，胸怀宽广。七杀有制，威严与智慧兼备。", career:"宜从事政治、军警、大型企业管理等。", relationships:"戌为寡宿，情感深沉不外露。宜温柔体贴的配偶。", ganZhiRelation:"壬坐戌七杀火库，戌藏辛丁戊。正印、正财、七杀同宫。杀印相生。", naYinMeaning:"大海水——大海之水，包容万象。格局宏大，前途无量。", luckyElements:["Earth","Wood"] },
  102: { poetry:"壬子日生，桑柘木音。大江东去，水势奔涌。羊刃帝旺，气魄非凡。", personality:"胸怀大志，气宇轩昂。水势浩大，有吞吐天地之志。", career:"宜从事国际性、宏观性的行业和岗位。", relationships:"子水桃花羊刃，感情如大江奔涌。需土制水以利婚姻。", ganZhiRelation:"壬坐子羊刃帝旺，子藏癸水。水旺极需土制，否则泛滥。", naYinMeaning:"桑柘木——桑柘养蚕，化水为用。以木泄水，方为有制。", luckyElements:["Earth","Wood"] },
  103: { poetry:"壬寅日生，大溪水音。江河东流，势不可挡。食神吐秀，才华洋溢。", personality:"才华洋溢，气度不凡。食神旺相，既有才气又有福气。", career:"宜从事创意、文化、娱乐、咨询等智商密集型行业。", relationships:"寅为红艳驿马，感情丰富多彩。宜稳重者互补。", ganZhiRelation:"壬坐寅食神，寅藏甲丙戊。食神生财，财生杀，格局连环。", naYinMeaning:"大溪水——溪流奔涌，生生不息。水木相生，才华源源不断。", luckyElements:["Earth","Metal"] },
  104: { poetry:"壬辰日生，沙中土音。龙入大海，翻江倒海。魁罡七杀，威势赫赫。", personality:"威势赫赫，气吞万里。魁罡加七杀，权威与魄力兼备。", career:"宜从军、政、大型企业等需强势领导力之业。", relationships:"辰中华盖魁罡，性格强势。宜温柔包容的配偶。", ganZhiRelation:"壬坐辰魁罡七杀，辰藏乙戊癸。伤官制杀，比劫助身，格局雄壮。", naYinMeaning:"沙中土——龙腾沙中，一飞冲天。魁罡之力，不可限量。", luckyElements:["Earth","Wood"] },
  105: { poetry:"壬午日生，天上火音。日照江河，水火既济。财官双美，富贵双全之格。", personality:"富贵气度，光明磊落。财官双美，既有财富又有品格。", career:"宜从政、金融、文化等阳光体面行业。", relationships:"午为正财正官桃花，配偶貌美有才。婚姻美满。", ganZhiRelation:"壬坐午正财正官，午藏丁己。财官双清，水火既济，上上之格。", naYinMeaning:"天上火——天上之日，光照万里。既济之格，前程似锦。", luckyElements:["Earth","Metal"] },
  106: { poetry:"壬申日生，石榴木音。金水相涵，泉涌不息。杀印相生，智勇双全。", personality:"智勇双全，文武兼备。杀印相生，既有胆识又有智慧。", career:"宜从事科技、学术、管理等需智商与魄力之业。", relationships:"申为驿马，独立性强。宜能并肩作战的配偶。", ganZhiRelation:"壬坐申偏印禄神，申藏庚壬戊。偏印、比肩、七杀。杀印相生格局。", naYinMeaning:"石榴木——石榴之木，花果繁盛。金水相涵，智慧结晶。", luckyElements:["Wood","Fire"] },
  107: { poetry:"壬戌日生，大海水音。海纳百川，有容乃大。七杀制身，以杀为用。", personality:"海纳百川，包容万象。心胸宽广，视野宏大。", career:"宜从事国际事务、大型组织、宏观策划等领域。", relationships:"戌为寡宿，感情深沉。宜情感丰沛的配偶互补。", ganZhiRelation:"壬坐戌七杀火库，戌藏辛丁戊。杀印相生，印星得力。", naYinMeaning:"大海水——大海之水，无边无际。格局宏大，前程无限。", luckyElements:["Earth","Wood"] },

  // ===== 癸水日柱 (108-119) =====
  108: { poetry:"癸丑日生，桑柘木音。雨露润土。丑为七杀金库，杀印相生。", personality:"柔中带刚，外圆内方。如细雨润物，默默付出而有力量。", career:"宜从事服务、医疗、教育、公益等奉献型行业。", relationships:"丑为华盖，性格内向。宜开朗的配偶打开心扉。", ganZhiRelation:"癸坐丑七杀金库，丑藏己癸辛。七杀、比肩、偏印同宫。杀印相生。", naYinMeaning:"桑柘木——桑柘之木，养蚕吐丝。以柔克刚，润物无声。", luckyElements:["Wood","Fire"] },
  109: { poetry:"癸卯日生，大溪水音。雨露润木，花木逢春。卯为食神文昌，文采出众。", personality:"文采出众，才华横溢。食神文昌同宫，聪明好学，才艺双全。", career:"宜从事教育、文学、艺术、设计等文化行业。", relationships:"卯为桃花文昌，异性缘佳。配偶宜有文化素养。", ganZhiRelation:"癸坐卯木食神，卯藏乙木。食神独旺，文昌入命，才华精纯。", naYinMeaning:"大溪水——溪水潺潺，润物无声。食神文昌，才情绵绵。", luckyElements:["Metal","Earth"] },
  110: { poetry:"癸巳日生，沙中土音。雨露润火。巳为正财正印正官，三星汇聚。", personality:"福泽深厚，格局贵气。财官印三星齐聚，一生运势不凡。", career:"宜从政、商、文化等主流行业，前途光明。", relationships:"巳为红艳，三星汇聚之格。婚姻幸福，配偶全能。", ganZhiRelation:"癸坐巳正财，巳藏丙戊庚。正财、正官、正印齐备。三星汇聚，贵格。", naYinMeaning:"沙中土——沙土含金，以水淘之。三星汇聚，福泽深厚。", luckyElements:["Metal","Earth"] },
  111: { poetry:"癸未日生，天上火音。雨露润土，滋养万物。未为七杀，杀印相生。", personality:"温润如雨，滋养他人。七杀有制，外表柔弱内有力量。", career:"宜从事医疗、护理、教育、公益等助人行业。", relationships:"未为寡宿，不善表达感情。宜主动经营的婚姻。", ganZhiRelation:"癸坐未七杀，未藏己丁乙。七杀、偏财、食神同宫。杀食相制。", naYinMeaning:"天上火——天上之火，以水济之。水火调和，刚柔并济。", luckyElements:["Wood","Metal"] },
  112: { poetry:"癸酉日生，石榴木音。雨露润金。酉为偏印，聪明有悟性。", personality:"悟性极高，聪明内秀。偏印旺相，有特殊才华和独特见解。", career:"宜从事研究、技术、玄学、艺术等需天赋之业。", relationships:"酉为桃花文昌，才貌双全。宜能欣赏你独特性的配偶。", ganZhiRelation:"癸坐酉偏印，酉藏辛金独印。偏印专旺，才华精纯但防孤僻。", naYinMeaning:"石榴木——石榴多子，金水相生。智慧结晶，果实累累。", luckyElements:["Wood","Fire"] },
  113: { poetry:"癸亥日生，大海水音。雨露汇海。亥为帝旺羊刃，水旺之极。", personality:"气势宏大，心境开阔。水旺之格，包容万象，格局不凡。", career:"宜从事海洋、贸易、文化、旅游等水属性行业。", relationships:"亥为桃花羊刃，感情如海深沉。宜土旺之配偶筑堤。", ganZhiRelation:"癸坐亥帝旺羊刃，亥藏壬甲。劫财伤官，水旺需土制。", naYinMeaning:"大海水——大海之水，深不可测。格局宏大，潜力无限。", luckyElements:["Earth","Wood"] },
  114: { poetry:"癸丑日生，桑柘木音。露水凝霜，外冷内温。七杀坐命，以智化之。", personality:"外表冷淡，内心温柔。七杀在内，有内在的力量和决心。", career:"宜从事研究、技术、管理等需内在定力之业。", relationships:"丑为华盖，感情内敛。宜热情的配偶融化冰霜。", ganZhiRelation:"癸坐丑七杀金库，丑藏己癸辛。七杀、比肩、偏印。杀印相生。", naYinMeaning:"桑柘木——桑柘养蚕，化杀为用。以柔克刚的智慧。", luckyElements:["Wood","Fire"] },
  115: { poetry:"癸卯日生，大溪水音。春霖润物，生机勃发。文昌食神，才思敏捷。", personality:"才思敏捷，创意无限。食神文昌交汇，才华如春泉涌出。", career:"宜从事创意、写作、设计、广告等脑力劳动。", relationships:"卯为桃花，浪漫多情。文昌入命，宜找灵魂伴侣。", ganZhiRelation:"癸坐卯食神文昌，卯藏乙木。食神独旺，文昌加持，才华横溢。", naYinMeaning:"大溪水——溪流奔腾，汇入江海。才华如溪，源源不断。", luckyElements:["Metal","Earth"] },
  116: { poetry:"癸巳日生，沙中土音。春霖润土，万物生长。三星汇聚，福泽自生。", personality:"福泽深厚，运势顺遂。财官印三星护持，人生平顺。", career:"无论从事何业皆有成就，宜择所爱。", relationships:"巳为红艳三星汇聚，婚姻极佳。配偶为贵人。", ganZhiRelation:"癸坐巳正财，巳藏丙戊庚。正财、正官、正印。三星会聚，贵格。", naYinMeaning:"沙中土——沙中藏金，水润金显。三星汇聚，福禄双全。", luckyElements:["Metal","Earth"] },
  117: { poetry:"癸未日生，天上火音。雨润旱田，济世之功。杀食相制，智勇双全。", personality:"智勇双全，外柔内刚。杀食相制，外表平和内有力量。", career:"宜从事医疗、法律、教育、公益等济世之业。", relationships:"未为寡宿，内心丰富。宜能深交的灵魂伴侣。", ganZhiRelation:"癸坐未七杀，未藏己丁乙。杀食相制，以智化杀，格局妙哉。", naYinMeaning:"天上火——天上之火，人间之灯。杀食相制，可为栋梁。", luckyElements:["Wood","Metal"] },
  118: { poetry:"癸酉日生，石榴木音。金水相生，玉振金声。偏印文昌，聪明绝顶。", personality:"聪明绝顶，才思出众。偏印旺相，有独到的见解和创造力。", career:"宜从事科研、艺术、哲学、玄学等需高悟性之业。", relationships:"酉为桃花文昌，才貌双全。宜精神伴侣。", ganZhiRelation:"癸坐酉偏印，酉藏辛金。偏印专旺，才华独到但防走偏锋。", naYinMeaning:"石榴木——石榴多子，智慧结晶。金水相涵，才思泉涌。", luckyElements:["Wood","Fire"] },
  119: { poetry:"癸亥日生，大海水音。万水归宗，海纳百川。水旺帝旺，气度恢宏。", personality:"气度恢宏，胸怀天下。水旺之人格局宏大，有包容之心。", career:"宜从事国际、宏观、战略层面的工作。", relationships:"亥为桃花羊刃，感情深邃。宜能容纳包容的配偶。", ganZhiRelation:"癸坐亥帝旺羊刃，亥藏壬甲。水旺极盛，需土筑堤，木泄水。", naYinMeaning:"大海水——大海无际，包容万象。胸怀天下，格局无限。", luckyElements:["Earth","Wood"] },
};

export function getDayPillarProfile(stemIndex: number, branchIndex: number): DayPillarProfile {
  const key = stemIndex * 12 + branchIndex;
  if (PROFILES[key]) return PROFILES[key];

  // Fallback: generate from element patterns
  const s = STEM_ELEMS[stemIndex];
  const b = BRANCH_ELEMS[branchIndex];
  return {
    poetry: `${STE[stemIndex]}${BRA[branchIndex]}日生。天干${s}，地支${b}，${s}${b}相生相克。`,
    personality: ELEM_PERSONALITY[s] || "个性鲜明，独树一帜。",
    career: ELEM_CAREER[s] || "宜择所爱，发挥天赋。",
    relationships: "婚姻需经营，宜互补型配偶。彼此包容方能长久。",
    ganZhiRelation: `${STE[stemIndex]}坐${BRA[branchIndex]}，${s}与${b}之间的关系决定格局走向。`,
    naYinMeaning: "纳音为六十甲子音律之一，反映天命气质。",
    luckyElements: [s, b],
  };
}
