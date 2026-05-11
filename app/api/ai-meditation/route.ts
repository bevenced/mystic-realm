import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { getDeepSeek } from "@/lib/deepseek";
import { parseAiJsonResponse } from "@/lib/ai-response";
import { MEDITATION_SYSTEM_PROMPT, buildMeditationUserPrompt, buildMeditationPreviewPrompt } from "@/lib/ai-prompts-meditation";
import { verifyPayPalOrder } from "@/lib/verify-paypal-order";
import { extractPreviewText, PREVIEW_FIELDS } from "@/lib/extract-preview";
import { checkSubscriptionAndRateLimit } from "@/lib/subscription-check";
import { recordAiUsage, consumeRedemption } from "@/lib/db";

const requestSchema = z.object({
  type: z.enum(["stress", "sleep", "focus", "self-healing", "gratitude"]),
  duration: z.enum(["5", "10", "15"]).default("10"),
  mood: z.string().max(500).default(""),
  orderId: z.string().optional(),
  redeemed: z.string().optional(),
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

    const { type, duration, mood, orderId, redeemed } = parsed.data;
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
      isPaid = await verifyPayPalOrder(orderId, "meditation");
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

    const deepseek = getDeepSeek();
    if (!deepseek) {
      return NextResponse.json(
        { error: "AI service is not configured." },
        { status: 503 },
      );
    }

    const prompt = isPaid
      ? buildMeditationUserPrompt({ type, duration, mood })
      : buildMeditationPreviewPrompt({ type, duration, mood });

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: MEDITATION_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: isPaid ? 2500 : 150,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "";
    const reading = isPaid
      ? parseAiJsonResponse(content) || buildMeditationFallback(content, type, duration)
      : { preview: extractPreviewText(content, [...PREVIEW_FIELDS.meditation]) };

    // Record AI usage for analytics
    const tokensUsed = completion.usage?.total_tokens || 0;
    if (dbUserId) {
      recordAiUsage(dbUserId, "meditation", tokensUsed).catch(() => {});
    }

    return NextResponse.json({
      reading,
      type,
      duration,
      tokensUsed,
    });
  } catch (error) {
    console.error("Meditation error:", error);
    return NextResponse.json(
      { error: "Failed to generate meditation." },
      { status: 500 },
    );
  }
}

function buildMeditationFallback(content: string, type: string, duration: string) {
  return {
    title: `${type} Meditation`,
    introduction: content,
    script: [{ phase: "core", instruction: content.slice(0, 500), duration: `${duration} minutes` }],
    breathingPattern: { name: "Deep Breathing", inhale: "4 seconds", hold: "0", exhale: "6 seconds", description: "A simple calming breath." },
    affirmations: ["I am at peace.", "I release what I cannot control.", "I embrace this moment."],
    tips: ["Find a quiet space", "Set an intention before starting"],
  };
}
