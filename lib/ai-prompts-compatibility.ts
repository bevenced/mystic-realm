// ===== Compatibility Analysis AI Prompts =====

export interface CompatibilityRequest {
  person1: {
    birthDate: string;
    birthHour: number;
    gender: string;
    baziData: any;
  };
  person2: {
    birthDate: string;
    birthHour: number;
    gender: string;
    baziData: any;
  };
}

export interface CompatibilityResult {
  overallScore: number;
  dimensions: {
    elementalHarmony: { score: number; analysis: string };
    dayMasterCompatibility: { score: number; analysis: string };
    pillarInteraction: { score: number; analysis: string };
    zodiacCompatibility: { score: number; analysis: string };
    lifeAlignment: { score: number; analysis: string };
  };
  strengths: string[];
  challenges: string[];
  advice: string[];
  summary: string;
}

export const COMPATIBILITY_SYSTEM_PROMPT = `You are a master of Chinese metaphysics specializing in relationship compatibility analysis. You analyze two people's BaZi (Four Pillars) charts to assess their harmony across multiple dimensions.

Your analysis covers:
1. Elemental harmony — how the Five Elements of each person interact
2. Day Master compatibility — the natural dynamic between two Day Masters
3. Pillar interaction — conflicts or harmonies between corresponding pillars
4. Zodiac compatibility — the traditional Chinese zodiac matching
5. Da Yun alignment — whether their life cycles complement each other

Your tone is:
- Warm and insightful — relationships are complex and nuanced
- Honest but diplomatic — point out challenges constructively
- Practical — give actionable advice for relationship growth
- Culturally grounded in Chinese metaphysical tradition

You MUST respond in valid JSON format with this exact structure:
{
  "overallScore": 0-100,
  "dimensions": {
    "elementalHarmony": { "score": 0-100, "analysis": "2-3 sentences" },
    "dayMasterCompatibility": { "score": 0-100, "analysis": "2-3 sentences" },
    "pillarInteraction": { "score": 0-100, "analysis": "2-3 sentences" },
    "zodiacCompatibility": { "score": 0-100, "analysis": "2-3 sentences" },
    "lifeAlignment": { "score": 0-100, "analysis": "2-3 sentences" }
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "challenges": ["challenge1", "challenge2", "challenge3"],
  "advice": ["advice1", "advice2", "advice3"],
  "summary": "2-3 sentence overall compatibility summary"
}`;

export function buildCompatibilityPrompt(req: CompatibilityRequest): string {
  const p1 = req.person1;
  const p2 = req.person2;

  return `== PERSON 1 ==
Birth: ${p1.birthDate}, Hour: ${p1.birthHour}:00, Gender: ${p1.gender}
Year Pillar: ${p1.baziData.year.stem}${p1.baziData.year.branch}
Month Pillar: ${p1.baziData.month.stem}${p1.baziData.month.branch}
Day Pillar: ${p1.baziData.day.stem}${p1.baziData.day.branch}
Hour Pillar: ${p1.baziData.hour.stem}${p1.baziData.hour.branch}
Day Master: ${p1.baziData.dayMasterYinYang} ${p1.baziData.dayMasterElement}
Elements: Wood(${p1.baziData.elementCounts.Wood}) Fire(${p1.baziData.elementCounts.Fire}) Earth(${p1.baziData.elementCounts.Earth}) Metal(${p1.baziData.elementCounts.Metal}) Water(${p1.baziData.elementCounts.Water})
Zodiac: ${p1.baziData.year.branch}

== PERSON 2 ==
Birth: ${p2.birthDate}, Hour: ${p2.birthHour}:00, Gender: ${p2.gender}
Year Pillar: ${p2.baziData.year.stem}${p2.baziData.year.branch}
Month Pillar: ${p2.baziData.month.stem}${p2.baziData.month.branch}
Day Pillar: ${p2.baziData.day.stem}${p2.baziData.day.branch}
Hour Pillar: ${p2.baziData.hour.stem}${p2.baziData.hour.branch}
Day Master: ${p2.baziData.dayMasterYinYang} ${p2.baziData.dayMasterElement}
Elements: Wood(${p2.baziData.elementCounts.Wood}) Fire(${p2.baziData.elementCounts.Fire}) Earth(${p2.baziData.elementCounts.Earth}) Metal(${p2.baziData.elementCounts.Metal}) Water(${p2.baziData.elementCounts.Water})
Zodiac: ${p2.baziData.year.branch}

Please provide a comprehensive compatibility analysis between these two individuals.`;
}
