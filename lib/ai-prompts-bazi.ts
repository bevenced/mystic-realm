// ===== BaZi AI Prompt System =====

export interface BaZiRequest {
  birthDate: string; // "YYYY-MM-DD"
  birthHour: number; // 0-23
  gender: "male" | "female";
  baziData: {
    year: { stem: string; branch: string; stemEn: string; branchEn: string; stemElement: string; branchElement: string };
    month: { stem: string; branch: string; stemEn: string; branchEn: string; stemElement: string; branchElement: string };
    day: { stem: string; branch: string; stemEn: string; branchEn: string; stemElement: string; branchElement: string };
    hour: { stem: string; branch: string; stemEn: string; branchEn: string; stemElement: string; branchElement: string };
    dayMasterElement: string;
    dayMasterYinYang: string;
    elementCounts: { Wood: number; Fire: number; Earth: number; Metal: number; Water: number };
  };
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
- You provide actionable advice for career, relationships, health, and personal development

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
      "meaning": "2-3 sentences about what this pillar reveals"
    },
    {
      "name": "Month Pillar",
      "meaning": "2-3 sentences about career and family influences"
    },
    {
      "name": "Day Pillar",
      "meaning": "2-3 sentences about self and relationships"
    },
    {
      "name": "Hour Pillar",
      "meaning": "2-3 sentences about hidden talents and aspirations"
    }
  ],
  "lifeAspects": {
    "personality": "2-3 sentences about personality traits",
    "career": "2-3 sentences about career direction",
    "relationships": "2-3 sentences about love and partnerships",
    "health": "2-3 sentences about health tendencies and advice"
  },
  "advice": "2-3 actionable recommendations for personal growth",
  "luckyElements": ["element1", "element2"],
  "affirmation": "A single empowering affirmation based on this chart"
}`;

export function buildBaZiUserPrompt(req: BaZiRequest): string {
  const { baziData } = req;
  return `Birth Date: ${req.birthDate}
Birth Hour: ${req.birthHour}:00
Gender: ${req.gender}

Four Pillars (BaZi):
Year Pillar: ${baziData.year.stem}(${baziData.year.stemEn}) ${baziData.year.branch}(${baziData.year.branchEn}) — ${baziData.year.stemElement}/${baziData.year.branchElement}
Month Pillar: ${baziData.month.stem}(${baziData.month.stemEn}) ${baziData.month.branch}(${baziData.month.branchEn}) — ${baziData.month.stemElement}/${baziData.month.branchElement}
Day Pillar: ${baziData.day.stem}(${baziData.day.stemEn}) ${baziData.day.branch}(${baziData.day.branchEn}) — ${baziData.day.stemElement}/${baziData.day.branchElement}
Hour Pillar: ${baziData.hour.stem}(${baziData.hour.stemEn}) ${baziData.hour.branch}(${baziData.hour.branchEn}) — ${baziData.hour.stemElement}/${baziData.hour.branchElement}

Day Master: ${baziData.dayMasterYinYang} ${baziData.dayMasterElement}

Element Counts:
- Wood: ${baziData.elementCounts.Wood}
- Fire: ${baziData.elementCounts.Fire}
- Earth: ${baziData.elementCounts.Earth}
- Metal: ${baziData.elementCounts.Metal}
- Water: ${baziData.elementCounts.Water}

Please provide a complete BaZi analysis covering all four pillars, element balance, personality traits, career direction, relationship dynamics, and health advice. Be practical and empowering.`;
}

export function buildBaZiPreviewPrompt(req: BaZiRequest): string {
  return `Birth: ${req.birthDate}, ${req.gender}
Day Master: ${req.baziData.dayMasterYinYang} ${req.baziData.dayMasterElement}
Elements: Wood(${req.baziData.elementCounts.Wood}) Fire(${req.baziData.elementCounts.Fire}) Earth(${req.baziData.elementCounts.Earth}) Metal(${req.baziData.elementCounts.Metal}) Water(${req.baziData.elementCounts.Water})

Give a brief 2-3 sentence overview of this BaZi profile. Focus on the Day Master element and element balance. Be encouraging. Under 80 words.`;
}
