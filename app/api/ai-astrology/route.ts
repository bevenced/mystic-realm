import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { getDeepSeek } from "@/lib/deepseek";
import { parseAiJsonResponse } from "@/lib/ai-response";
import { calculateZodiac, type ZodiacInfo } from "@/lib/astrology";
import { ASTROLOGY_SYSTEM_PROMPT, buildAstrologyUserPrompt, buildAstrologyPreviewPrompt } from "@/lib/ai-prompts-astrology";
import { verifyPayPalOrder } from "@/lib/verify-paypal-order";
import { extractPreviewText, PREVIEW_FIELDS } from "@/lib/extract-preview";
import { getLocaleInstruction } from "@/lib/ai-locale";
import { checkSubscriptionAndRateLimit } from "@/lib/subscription-check";
import { recordAiUsage, consumeRedemption } from "@/lib/db";

const requestSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthHour: z.number().int().min(0).max(23),
  orderId: z.string().optional(),
  redeemed: z.string().optional(),
  locale: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { birthDate, birthHour, orderId, redeemed, locale } = parsed.data;
    const authUser = await getAuthUser(req);
    const userId = authUser?.id || null;

    let isPaid = false;
    if (orderId) {
      if (!userId) {
        return NextResponse.json(
          { error: "Please sign in to use paid readings." },
          { status: 401 },
        );
      }
      isPaid = await verifyPayPalOrder(orderId, "astrology");
    }

    // Points redemption: validate one-time token
    if (redeemed && userId) {
      const redemption = await consumeRedemption(redeemed);
      if (redemption) {
        isPaid = true;
      }
    }

    const { allowed, dbUserId, retryAfter } = await checkSubscriptionAndRateLimit(req, userId, isPaid);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter || "60",
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const [year, month, day] = birthDate.split("-").map(Number);
    const zodiacData = calculateZodiac(year, month, day, birthHour);

    const deepseek = getDeepSeek();
    if (!deepseek) {
      return NextResponse.json(
        { error: "AI service is not configured." },
        { status: 503 },
      );
    }

    const prompt = isPaid
      ? buildAstrologyUserPrompt({ birthDate, birthHour, zodiacData })
      : buildAstrologyPreviewPrompt({ birthDate, birthHour, zodiacData });

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: ASTROLOGY_SYSTEM_PROMPT + "\n\n" + getLocaleInstruction(locale || "en") },
        { role: "user", content: prompt },
      ],
      max_tokens: isPaid ? 2000 : 150,
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content || "";
    const reading = isPaid
      ? parseAiJsonResponse(content) || buildAstrologyFallback(content, zodiacData)
      : { preview: extractPreviewText(content, [...PREVIEW_FIELDS.astrology]) };

    // Record AI usage for analytics
    const tokensUsed = completion.usage?.total_tokens || 0;
    if (dbUserId) {
      recordAiUsage(dbUserId, "astrology", tokensUsed).catch(() => {});
    }

    return NextResponse.json({
      zodiacData,
      reading,
      birthDate,
      birthHour,
      tokensUsed,
    });
  } catch (error) {
    console.error("Astrology error:", error);
    return NextResponse.json(
      { error: "Failed to generate astrology reading." },
      { status: 500 },
    );
  }
}

function buildAstrologyFallback(content: string, zodiacData: ZodiacInfo) {
  return {
    overview: content,
    bigThree: {
      sun: `${zodiacData.sunSign} represents your core identity.`,
      moon: `${zodiacData.moonSign} reflects your emotional nature.`,
      rising: `${zodiacData.risingSign} shapes your outer persona.`,
    },
    planetaryInfluences: [
      { planet: `Sun in ${zodiacData.sunSign}`, influence: content.slice(0, 200) },
    ],
    lifeAspects: { love: "See full analysis", career: "See full analysis", growth: "See full analysis" },
    currentTransits: "See full analysis",
    advice: "Consider the full reading for detailed guidance.",
    affirmation: "I am aligned with the cosmic energies that guide me.",
  };
}
