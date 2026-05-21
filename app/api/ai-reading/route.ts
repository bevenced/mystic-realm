import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { getDeepSeek } from "@/lib/deepseek";
import { parseAiJsonResponse } from "@/lib/ai-response";
import { drawCards, getSpread } from "@/lib/tarot";
import { SYSTEM_PROMPT, buildUserPrompt, buildPreviewPrompt } from "@/lib/ai-prompts";
import { verifyPayPalOrder } from "@/lib/verify-paypal-order";
import { extractPreviewText, PREVIEW_FIELDS } from "@/lib/extract-preview";
import { getLocaleInstruction } from "@/lib/ai-locale";
import { checkSubscriptionAndRateLimit } from "@/lib/subscription-check";
import { recordAiUsage, consumeRedemption } from "@/lib/db";

const requestSchema = z.object({
  spreadKey: z.enum(["three-card", "five-card", "celtic-cross"]),
  question: z.string().min(3).max(500),
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

    const { spreadKey, question, orderId, redeemed, locale } = parsed.data;
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
      isPaid = await verifyPayPalOrder(orderId, "tarot");
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

    const spread = getSpread(spreadKey);
    const drawn = drawCards(spread.cardCount);
    const cardData = drawn.map((d, i) => ({
      name: d.card.name,
      position: spread.positions[i],
      isReversed: d.isReversed,
      emoji: d.card.emoji,
      keywords: d.card.keywords,
    }));

    const deepseek = getDeepSeek();
    if (!deepseek) {
      return NextResponse.json(
        { error: "AI service is not configured. Please set DEEPSEEK_API_KEY." },
        { status: 503 },
      );
    }

    const readingPrompt = isPaid
      ? buildUserPrompt({ spreadKey, question, cards: cardData })
      : buildPreviewPrompt({ spreadKey, question, cards: cardData });

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + "\n\n" + getLocaleInstruction(locale || "en") },
        { role: "user", content: readingPrompt },
      ],
      max_tokens: isPaid ? 1500 : 150,
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content || "";
    const reading = isPaid
      ? parseAiJsonResponse(content) || buildReadingFallback(content, cardData)
      : { preview: extractPreviewText(content, [...PREVIEW_FIELDS.reading]) };

    // Record AI usage for analytics
    const tokensUsed = completion.usage?.total_tokens || 0;
    if (dbUserId) {
      recordAiUsage(dbUserId, "reading", tokensUsed).catch(() => {});
    }

    return NextResponse.json({
      cards: cardData,
      reading,
      spreadKey,
      spreadName: spread.name,
      question,
      tokensUsed,
    });
  } catch (error) {
    console.error("AI Reading error:", error);
    return NextResponse.json(
      { error: "Failed to generate reading. Please try again." },
      { status: 500 },
    );
  }
}

function buildReadingFallback(content: string, cardData: Array<Record<string, unknown>>) {
  return {
    overview: content,
    cards: cardData.map((c) => ({
      position: c.position,
      interpretation: `The ${c.name} in the ${c.position} position suggests a time of reflection.`,
      advice: "Trust your intuition as you navigate this energy.",
    })),
    summary: content.slice(0, 200),
    affirmation: "I trust in the wisdom of my journey.",
  };
}
