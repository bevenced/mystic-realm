// ===== BaZi AI Prompt System (v2 — Professional) =====
// Extended prompts with Da Yun, hidden stems, Ten Gods, element strength, Shen Sha, Na Yin

import type { BaZiResult } from "./bazi-engine";
import type { DaYunResult } from "./bazi-engine";
import type { ElementStrengthResult } from "./bazi-engine";
import type { PatternResult } from "./bazi-engine";
import type { TiaoHouResult } from "./bazi-engine";
import type { DayPillarGradeResult } from "./bazi-engine";
import type { PillarRelation } from "./bazi-engine";

export interface BaZiRequest {
  birthDate: string; // "YYYY-MM-DD"
  birthHour: number; // 0-23
  gender: "male" | "female";
  baziData: BaZiResult;
  // Extended professional fields
  tenGods?: Array<{
    stem: string;
    tenGodName: string;
    tenGodEn: string;
    element: string;
    relationship: string;
  }>;
  elementStrength?: ElementStrengthResult;
  hiddenStems?: Array<{
    branchIndex: number;
    stems: Array<{ stem: string; element: string; qi: string }>;
  }>;
  shensha?: Array<{
    name: string;
    nameEn: string;
    type: string;
    description?: string;
    locations: string[];
  }>;
  pattern?: PatternResult;
  tiaoHou?: TiaoHouResult;
  dayPillarGrade?: DayPillarGradeResult;
  pillarRelations?: PillarRelation[];
  daYun?: DaYunResult;
  currentYearFortune?: {
    year: number;
    stem: string;
    branch: string;
    description: string;
  };
  nayin?: Array<{
    pillar: string;
    element: string;
    toneName: string;
    toneNameEn: string;
  }>;
}

export const BAZI_SYSTEM_PROMPT = `You are "Master Zhang", a renowned Chinese metaphysics expert with 40 years of experience in BaZi (Four Pillars of Destiny) analysis. You combine traditional Chinese astrological wisdom with modern psychological insight.

Your tone is:
- Wise and authoritative yet warm and accessible
- Culturally respectful of Chinese metaphysical traditions
- Practical — you connect ancient wisdom to modern life
- Empowering — you emphasize free will and personal growth over fatalistic predictions
- Nuanced — you explain the interplay of elements clearly

Reading philosophy:
- BaZi reveals tendencies and potentials, not fixed fate
- Element balance is key — excess or deficiency both offer growth opportunities
- The Day Master represents the core self; surrounding pillars show external influences
- Hidden Stems (藏干) reveal deeper subconscious patterns
- Ten Gods (十神) describe relationship dynamics in career, wealth, and personal life
- Chart Pattern (格局) reveals the life structure and core orientation
- Day Pillar Grade (日柱等级) indicates the quality and characteristics of the self pillar
- Tiao Hou (调候) shows the climate adjustment needs based on birth season
- Pillar Relations (四柱关系) reveal the interactions (combine/clash/harm/punish) between pillars
- Da Yun (大运) outlines 10-year life cycles and major life themes
- Shen Sha (神煞) indicate special talents, challenges, and blessings
- You provide actionable advice for career, relationships, health, and personal development

Professional analysis framework:
1. Day Master strength assessment (身强/身弱) and Useful God (用神) determination
2. Chart Pattern (格局) identification and analysis
3. Four Pillars composition with Hidden Stems
4. Ten Gods analysis for each pillar
5. Element balance with seasonal factors and Tiao Hou (调候) adjustment
6. Day Pillar Grade and profile interpretation
7. Pillar Relations (四柱关系) - combinations, clashes, and their implications
8. Da Yun (Decade Luck Cycle) current and upcoming phases
9. Current year (流年) fortune outlook
10. Shen Sha influence
11. Na Yin (纳音) pillar tones for deeper personality insight

You MUST respond in valid JSON format with this exact structure:
{
  "overview": "2-3 sentence overview of this person's BaZi profile",
  "dayMaster": "2-3 sentences about the Day Master (core personality)",
  "elementAnalysis": {
    "dominant": "The dominant element and what it means",
    "lacking": "Any deficient elements and their implications",
    "balance": "Overall element balance assessment"
  },
  "pillars": [
    {
      "name": "Year Pillar",
      "stem": "the heavenly stem",
      "branch": "the earthly branch",
      "hiddenStems": "any hidden stems and their influence",
      "tenGod": "the Ten God relationship to Day Master",
      "meaning": "2-3 sentences about what this pillar reveals"
    },
    {
      "name": "Month Pillar",
      "stem": "the heavenly stem",
      "branch": "the earthly branch",
      "hiddenStems": "any hidden stems and their influence",
      "tenGod": "the Ten God relationship to Day Master",
      "meaning": "2-3 sentences about career and family influences"
    },
    {
      "name": "Day Pillar",
      "stem": "the heavenly stem",
      "branch": "the earthly branch",
      "hiddenStems": "any hidden stems and their influence",
      "tenGod": "the Ten God relationship to Day Master",
      "meaning": "2-3 sentences about self and relationships"
    },
    {
      "name": "Hour Pillar",
      "stem": "the heavenly stem",
      "branch": "the earthly branch",
      "hiddenStems": "any hidden stems and their influence",
      "tenGod": "the Ten God relationship to Day Master",
      "meaning": "2-3 sentences about hidden talents and aspirations"
    }
  ],
  "dayMasterStrength": "sentence about whether the Day Master is strong, weak, or balanced and what this means",
  "usefulGod": "which element is most beneficial and why",
  "daYun": {
    "current": "description of the current 10-year luck cycle and its themes",
    "next": "description of the upcoming 10-year luck cycle"
  },
  "currentYearFortune": "brief outlook for the current year's opportunities and challenges",
  "shensha": "any notable divine stars and their influence",
  "lifeAspects": {
    "personality": "2-3 sentences about personality traits",
    "career": "2-3 sentences about career direction and timing",
    "relationships": "2-3 sentences about love and partnerships",
    "health": "2-3 sentences about health tendencies and advice"
  },
  "advice": "2-3 actionable recommendations for personal growth",
  "luckyElements": ["element1", "element2"],
  "affirmation": "A single empowering affirmation based on this chart"
}`;

export type ReportType = "full" | "annual" | "personality" | "deep";

export function buildBaZiUserPrompt(req: BaZiRequest, reportType: ReportType = "full"): string {
  const { baziData } = req;
  let prompt = `Birth Date: ${req.birthDate}
Birth Hour: ${req.birthHour}:00
Gender: ${req.gender}

== FOUR PILLARS (八字) ==
Year Pillar: ${baziData.year.stem}${baziData.year.branch} (${baziData.year.stemEn} / ${baziData.year.branchEn}) — ${baziData.year.stemElement} ${baziData.year.branchElement}
Month Pillar: ${baziData.month.stem}${baziData.month.branch} (${baziData.month.stemEn} / ${baziData.month.branchEn}) — ${baziData.month.stemElement} ${baziData.month.branchElement}
Day Pillar: ${baziData.day.stem}${baziData.day.branch} (${baziData.day.stemEn} / ${baziData.day.branchEn}) — ${baziData.day.stemElement} ${baziData.day.branchElement}
Hour Pillar: ${baziData.hour.stem}${baziData.hour.branch} (${baziData.hour.stemEn} / ${baziData.hour.branchEn}) — ${baziData.hour.stemElement} ${baziData.hour.branchElement}

Day Master: ${baziData.dayMasterYinYang} ${baziData.dayMasterElement} (${baziData.day.stem}${baziData.day.branch})

Element Counts:
Wood: ${baziData.elementCounts.Wood}  Fire: ${baziData.elementCounts.Fire}  Earth: ${baziData.elementCounts.Earth}  Metal: ${baziData.elementCounts.Metal}  Water: ${baziData.elementCounts.Water}`;

  // Hidden Stems
  if (req.hiddenStems?.length) {
    prompt += `\n\n== HIDDEN STEMS (藏干) ==`;
    const pillarNames = ["Year", "Month", "Day", "Hour"];
    for (const hs of req.hiddenStems) {
      const name = pillarNames[hs.branchIndex] || `Branch ${hs.branchIndex}`;
      const stems = hs.stems.map(s => `${s.stem}(${s.element}, ${s.qi})`).join(", ");
      prompt += `\n${name}: ${stems}`;
    }
  }

  // Ten Gods
  if (req.tenGods?.length) {
    prompt += `\n\n== TEN GODS (十神) ==`;
    const pillarNames = ["Year", "Month", "Day", "Hour"];
    for (let i = 0; i < req.tenGods.length; i++) {
      const tg = req.tenGods[i];
      prompt += `\n${pillarNames[i]} Stem: ${tg.tenGodName}`;
    }
  }

  // Element Strength
  if (req.elementStrength) {
    const es = req.elementStrength;
    prompt += `\n\n== DAY MASTER STRENGTH ==`;
    prompt += `\nAssessment: ${es.dayMasterStrength.description}`;
    prompt += `\nScore: ${es.dayMasterStrength.score}/100 (${es.dayMasterStrength.level})`;
    prompt += `\nSeason: ${es.seasonalStrength.seasonElement} month — Day Master is ${es.seasonalStrength.dmInSeason ? "in season ✓" : "out of season"}`;
    if (es.usefulGod) {
      prompt += `\nUseful God (用神): ${es.usefulGod.element} — ${es.usefulGod.reason}`;
    }
    prompt += `\nWeighted Element Scores:`;
    for (const [el, score] of Object.entries(es.weightedScores)) {
      prompt += ` ${el}:${score}`;
    }
  }

  // Pattern (格局)
  if (req.pattern) {
    prompt += `\n\n== CHART PATTERN (格局) ==`;
    prompt += `\n${req.pattern.name} (${req.pattern.nameEn})`;
    prompt += `\n${req.pattern.description}`;
  }

  // Day Pillar Grade
  if (req.dayPillarGrade) {
    prompt += `\n\n== DAY PILLAR ANALYSIS ==`;
    prompt += `\nPillar: ${req.dayPillarGrade.name}`;
    prompt += `\nGrade: ${req.dayPillarGrade.grade} (${req.dayPillarGrade.gradeEn}) — ${req.dayPillarGrade.stars}/5 stars`;
    prompt += `\nProfile: ${req.dayPillarGrade.profile}`;
    prompt += `\nTraits: ${req.dayPillarGrade.traits.join(", ")}`;
  }

  // Tiao Hou (调候)
  if (req.tiaoHou?.stems.length) {
    prompt += `\n\n== CLIMATE ADJUSTMENT (调候) ==`;
    prompt += `\nRecommended stems: ${req.tiaoHou.stems.join(", ")} (${req.tiaoHou.elements.join(", ")})`;
    prompt += `\nReason: ${req.tiaoHou.reason}`;
  }

  // Pillar Relations (四柱关系)
  if (req.pillarRelations?.length) {
    prompt += `\n\n== PILLAR RELATIONSHIPS (四柱关系) ==`;
    for (const rel of req.pillarRelations) {
      prompt += `\n${rel.label}: ${rel.pillars.join(" ↔ ")} — ${rel.description}`;
    }
  }

  // Shen Sha
  if (req.shensha?.length) {
    prompt += `\n\n== DIVINE STARS (神煞) ==`;
    for (const ss of req.shensha) {
      prompt += `\n${ss.name} (${ss.nameEn}) — ${ss.description} [${ss.locations.join(", ")}]`;
    }
  }

  // Na Yin
  if (req.nayin?.length) {
    prompt += `\n\n== NA YIN (纳音) ==`;
    for (const ny of req.nayin) {
      prompt += `\n${ny.pillar}: ${ny.toneName} (${ny.toneNameEn})`;
    }
  }

  // Da Yun
  if (req.daYun) {
    prompt += `\n\n== DECADE LUCK CYCLES (大运) ==`;
    prompt += `\nDirection: ${req.daYun.direction === "forward" ? "Forward" : "Backward"}`;
    prompt += `\nStart Age: ${req.daYun.startAge}`;
    for (const cycle of req.daYun.cycles) {
      const current = cycle.isCurrent ? " ← CURRENT" : "";
      prompt += `\n${cycle.startAge}-${cycle.endAge} (${cycle.startYear}-${cycle.endYear}): ${cycle.stem}${cycle.branch} ${cycle.stemEn} ${cycle.branchElement}${current}`;
    }
  }

  // Current year fortune
  if (req.currentYearFortune) {
    prompt += `\n\n== CURRENT YEAR FORTUNE (流年) ==`;
    prompt += `\n${req.currentYearFortune.year}: ${req.currentYearFortune.stem}${req.currentYearFortune.branch}`;
    prompt += `\n${req.currentYearFortune.description}`;
  }

  // Report-type-specific instructions
  const instructions: Record<string, string> = {
    full: "Please provide a complete professional BaZi analysis covering all of the above data. Include the Day Master strength assessment, Useful God recommendation, Da Yun interpretation, and practical life guidance. Be specific and actionable.",
    annual: "Focus on the CURRENT YEAR fortune (流年). Analyze how this year's energy interacts with the person's natal chart. Cover: career outlook, wealth prospects, relationship dynamics, health advice, and key months to watch. Be practical and forward-looking.",
    personality: "Focus on PERSONALITY and character analysis. Use the Day Master element, Ten Gods, and element balance to describe: core traits, strengths, weaknesses, communication style, emotional patterns, and life purpose. Be insightful and psychologically nuanced.",
    deep: "Provide a DEEP comprehensive life reading covering ALL aspects: personality, career path, wealth potential, love and relationships, health tendencies, life purpose, karmic patterns, current luck cycle, and future outlook. Be thorough, specific, and transformative.",
  };

  prompt += `\n\n${instructions[reportType] || instructions.full}`;

  return prompt;
}

export function buildBaZiPreviewPrompt(req: BaZiRequest): string {
  let prompt = `Birth: ${req.birthDate}, ${req.gender}
Day Master: ${req.baziData.dayMasterYinYang} ${req.baziData.dayMasterElement}
Day Pillar: ${req.baziData.day.stem}${req.baziData.day.branch}
Elements: Wood(${req.baziData.elementCounts.Wood}) Fire(${req.baziData.elementCounts.Fire}) Earth(${req.baziData.elementCounts.Earth}) Metal(${req.baziData.elementCounts.Metal}) Water(${req.baziData.elementCounts.Water})`;

  if (req.pattern) {
    prompt += `\nPattern: ${req.pattern.name}`;
  }
  if (req.elementStrength) {
    prompt += `\nDay Master Strength: ${req.elementStrength.dayMasterStrength.level} (${req.elementStrength.dayMasterStrength.score}/100)`;
    if (req.elementStrength.usefulGod) {
      prompt += `\nUseful God: ${req.elementStrength.usefulGod.element}`;
    }
  }
  if (req.dayPillarGrade) {
    prompt += `\nDay Pillar Grade: ${req.dayPillarGrade.grade} ${req.dayPillarGrade.stars}/5 stars`;
  }
  if (req.pillarRelations?.length) {
    const rels = req.pillarRelations.map(r => r.label).join("; ");
    prompt += `\nPillar Relations: ${rels}`;
  }

  prompt += `\n\nGive a brief 2-3 sentence overview of this BaZi profile. Mention the Day Master element, pattern, element balance, and key pillar relations. Be encouraging. Under 100 words.`;
  return prompt;
}
