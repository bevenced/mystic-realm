// ===== Purpose-Specific Reading Prompts =====

export type PurposeType = "career" | "wealth" | "health" | "love";

export interface PurposeRequest {
  purpose: PurposeType;
  birthDate: string;
  birthHour: number;
  gender: string;
  baziData: any;
}

const PURPOSE_PROMPTS: Record<PurposeType, string> = {
  career: `You are a career guidance specialist using BaZi (Four Pillars) analysis. Focus specifically on:
- Career aptitudes indicated by the Day Master and Ten Gods
- Favorable industries based on element balance
- Timing for career changes using Da Yun cycles
- Leadership potential and team dynamics
- Recommended career paths that align with the person's natural strengths

Give specific, actionable career advice. Reference classical principles where relevant.`,

  wealth: `You are a wealth and financial guidance specialist using BaZi analysis. Focus specifically on:
- Wealth stars (财星) in the chart — their strength and position
- Element patterns that attract or block wealth
- Timing for financial decisions based on luck cycles
- Natural earning potential and best income sources
- Strategies for wealth accumulation based on element balance

Give specific financial guidance. Reference classical wealth principles.`,

  health: `You are a health and wellness specialist using BaZi (Four Pillars) analysis combined with traditional Chinese medicine. Focus specifically on:
- Constitutional strengths and weaknesses indicated by element balance
- Organs and body systems associated with deficient or excessive elements
- Health tendencies in different life phases (Da Yun cycles)
- Preventive care recommendations based on element imbalances
- Diet, exercise, and lifestyle adjustments by element type

Give practical health guidance. Reference the Wu Xing (Five Elements) organ correspondence.`,

  love: `You are a relationships and love specialist using BaZi analysis. Focus specifically on:
- Relationship indicators in the chart (日支, 配偶宫)
- The person's natural approach to love and partnership
- Favorable periods for love and marriage based on luck cycles
- Ideal partner characteristics based on element complement
- Patterns and lessons in relationships indicated by the pillars

Give warm, insightful relationship guidance. Be encouraging while honest about challenges.`,
};

export const PURPOSE_SYSTEM_PROMPT = `You are "Master Zhang", a BaZi specialist who provides focused readings for specific life areas.`;

export function buildPurposeUserPrompt(req: PurposeRequest): string {
  const prompt = PURPOSE_PROMPTS[req.purpose];
  return `Purpose: ${req.purpose.toUpperCase()}
Birth: ${req.birthDate}, Hour: ${req.birthHour}:00, Gender: ${req.gender}

== FOUR PILLARS ==
Year: ${req.baziData.year.stem}${req.baziData.year.branch}
Month: ${req.baziData.month.stem}${req.baziData.month.branch}
Day: ${req.baziData.day.stem}${req.baziData.day.branch}
Hour: ${req.baziData.hour.stem}${req.baziData.hour.branch}
Day Master: ${req.baziData.dayMasterYinYang} ${req.baziData.dayMasterElement}
Elements: Wood(${req.baziData.elementCounts.Wood}) Fire(${req.baziData.elementCounts.Fire}) Earth(${req.baziData.elementCounts.Earth}) Metal(${req.baziData.elementCounts.Metal}) Water(${req.baziData.elementCounts.Water})

${prompt}

Please provide a focused analysis addressing the specific life area above. Be practical and specific.`;
}
