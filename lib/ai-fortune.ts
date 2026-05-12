// ===== Personalized AI Fortune Prompts =====

import { getDeepSeek } from "@/lib/deepseek";
import type { BaZiResult, BaZiPillar } from "@/lib/bazi";

// ── Legacy single-sentence fortune (fallback) ──

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
    return fortune.replace(/^["']|["']$/g, "").replace(/^Today,?\s*/i, "") || null;
  } catch (error) {
    console.error("generateFortune error:", error);
    return null;
  }
}

// ── Structured multi-aspect fortune ──

export interface FortuneAspect {
  name: string;
  rating: "strong" | "neutral" | "weak";
  note: string;
}

export interface StructuredFortune {
  aspects: FortuneAspect[];
  advice: string;
  luckyColor: string;
  luckyNumber: number;
}

const STRUCTURED_SYSTEM_PROMPT = `You are an expert in Chinese BaZi (Four Pillars of Destiny) metaphysics, writing for an English-speaking audience. Your task is to analyze how today's Heavenly Stem and Earthly Branch energy interacts with the user's natal BaZi chart, then produce a structured daily fortune covering five life aspects.

Five Elements interaction rules for context:
- Same element as the Day Master → supportive, harmonious
- Element that produces/generates the Day Master (e.g. Water → Wood) → nourishing, energizing
- Element produced by the Day Master (e.g. Wood → Fire) → expressive but draining
- Element that controls/restricts the Day Master (e.g. Metal → Wood) → challenging, need caution
- Element controlled by the Day Master (e.g. Wood → Earth) → manageable, steady

Output ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "aspects": [
    {"name": "Wealth", "rating": "strong", "note": "One short sentence explaining why (relate to elements)"},
    {"name": "Career", "rating": "neutral", "note": "One short sentence..."},
    {"name": "Relationships", "rating": "weak", "note": "One short sentence..."},
    {"name": "Health", "rating": "strong", "note": "One short sentence..."},
    {"name": "Social", "rating": "neutral", "note": "One short sentence..."}
  ],
  "advice": "One practical sentence of actionable daily advice specific to this person's chart and today's energy",
  "luckyColor": "A single color name that benefits today's energy for this person",
  "luckyNumber": 7
}

Rating meanings:
- "strong" = today's energy supports or nourishes this area of their life
- "weak" = today's energy conflicts with, drains, or challenges this area
- "neutral" = neither strongly supportive nor conflicting

Rules:
- Keep each note under 120 characters
- Always reference the Five Elements in your reasoning
- Advice must be practical and specific to today, not generic
- luckyNumber must be between 1 and 9
- Use relevant emojis in notes to make them lively and engaging (e.g. 💰 for wealth, 💼 for career, ❤️ for relationships, 💪 for health, 🤝 for social)`;

export function buildEnhancedPrompt(
  ctx: FortuneContext,
  todayPillar: BaZiPillar,
): string {
  const elements = Object.entries(ctx.elementCounts)
    .map(([e, c]) => `${e}:${c}`)
    .join(", ");

  return `Generate a structured daily fortune for this person:

Name: ${ctx.name || "Unknown"}
Age: ${ctx.age}
Day Master: ${ctx.dayMasterYinYang} ${ctx.dayMasterElement} (Zodiac: ${ctx.zodiac})
Natal Element Balance: ${elements}

Today's Pillar: ${todayPillar.stem}${todayPillar.branch} (${todayPillar.stemEn}, ${todayPillar.branchEn})
Today's Stem Element: ${todayPillar.stemElement}
Today's Branch Element: ${todayPillar.branchElement}

Analyze how today's ${todayPillar.stemElement} (stem) / ${todayPillar.branchElement} (branch) energy interacts with their ${ctx.dayMasterElement} Day Master and overall element balance across the five life aspects.`;
}

export async function generateStructuredFortune(
  ctx: FortuneContext,
  todayPillar: BaZiPillar,
): Promise<StructuredFortune | null> {
  const deepseek = getDeepSeek();
  if (!deepseek) return null;

  try {
    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: STRUCTURED_SYSTEM_PROMPT },
        { role: "user", content: buildEnhancedPrompt(ctx, todayPillar) },
      ],
      max_tokens: 600,
      temperature: 0.8,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "";
    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```(?:json)?\s*([\s\S]*?)```$/m, "$1").trim();
    const parsed = JSON.parse(jsonStr) as StructuredFortune;

    // Validate structure
    if (!parsed.aspects || !Array.isArray(parsed.aspects) || parsed.aspects.length !== 5) {
      throw new Error("Invalid aspects array");
    }
    if (!parsed.advice || !parsed.luckyColor || typeof parsed.luckyNumber !== "number") {
      throw new Error("Missing required fields");
    }

    return parsed;
  } catch (error) {
    console.error("generateStructuredFortune error:", error);
    return null;
  }
}

// ── Helper to try parsing a fortune string as structured data ──

export function tryParseStructured(fortune: string): StructuredFortune | null {
  try {
    const parsed = JSON.parse(fortune) as StructuredFortune;
    if (parsed.aspects && Array.isArray(parsed.aspects) && parsed.aspects.length === 5) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
