// ===== Personalized AI Fortune Prompt =====

import { getDeepSeek } from "@/lib/deepseek";
import type { BaZiResult } from "@/lib/bazi";

export const FORTUNE_SYSTEM_PROMPT = `You are a mystical fortune teller blending Chinese BaZi (Four Pillars of Destiny) metaphysics with daily guidance.

Generate ONE sentence of personalized daily fortune. Be poetic, mystical, and genuinely informed by the person's BaZi chart.

Rules:
- Always reference their Day Master element, animal sign, or elemental balance
- Never use generic platitudes like "good things are coming" without anchoring to their chart
- Keep it under 120 characters
- Return plain text only — no quotes, no markdown, no "Today..." prefix`;

export interface FortuneContext {
  name?: string;
  gender?: string;
  age: number;
  dayMasterElement: string;
  dayMasterYinYang: string;
  zodiac: string;
  streak: number;
  elementCounts: Record<string, number>;
}

export function buildFortunePrompt(ctx: FortuneContext): string {
  const elements = Object.entries(ctx.elementCounts)
    .map(([e, c]) => `${e}:${c}`)
    .join(", ");

  const namePart = ctx.name ? `for ${ctx.name}` : "";
  const genderPart = ctx.gender ? `(${ctx.gender})` : "";
  const streakPart = ctx.streak > 1 ? `Day ${ctx.streak} of their check-in streak.` : "";

  return `Write a one-sentence personalized daily fortune ${namePart} ${genderPart}.
Age: ${ctx.age} | Zodiac: ${ctx.zodiac}
Day Master: ${ctx.dayMasterYinYang} ${ctx.dayMasterElement}
Elements: ${elements}
${streakPart}`;
}

export async function generateFortune(ctx: FortuneContext): Promise<string | null> {
  const deepseek = getDeepSeek();
  if (!deepseek) return null;

  try {
    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: FORTUNE_SYSTEM_PROMPT },
        { role: "user", content: buildFortunePrompt(ctx) },
      ],
      max_tokens: 80,
      temperature: 0.9,
    });

    const fortune = completion.choices[0]?.message?.content?.trim() || "";
    // Clean up: remove quotes, strip trailing period if it's a fragment
    return fortune.replace(/^["']|["']$/g, "").replace(/^Today,?\s*/i, "") || null;
  } catch (error) {
    console.error("generateFortune error:", error);
    return null;
  }
}
