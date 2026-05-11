import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { getDeepSeek } from "@/lib/deepseek";
import { parseAiJsonResponse } from "@/lib/ai-response";
import { FENGSHUI_SYSTEM_PROMPT, buildFengShuiUserPrompt, buildFengShuiPreviewPrompt } from "@/lib/ai-prompts-fengshui";
import { verifyPayPalOrder } from "@/lib/verify-paypal-order";
import { extractPreviewText, PREVIEW_FIELDS } from "@/lib/extract-preview";
import { checkSubscriptionAndRateLimit } from "@/lib/subscription-check";
import { recordAiUsage, consumeRedemption } from "@/lib/db";

const requestSchema = z.object({
  homeType: z.enum(["apartment", "house", "studio", "office"]),
  roomDescription: z.string().min(10).max(1000),
  concerns: z.string().max(500).default(""),
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

    const { homeType, roomDescription, concerns, orderId, redeemed } = parsed.data;
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
      isPaid = await verifyPayPalOrder(orderId, "fengshui");
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
      ? buildFengShuiUserPrompt({ homeType, roomDescription, concerns })
      : buildFengShuiPreviewPrompt({ homeType, roomDescription, concerns });

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: FENGSHUI_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: isPaid ? 1800 : 150,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "";
    const reading = isPaid
      ? parseAiJsonResponse(content) || buildFengShuiFallback(content)
      : { preview: extractPreviewText(content, [...PREVIEW_FIELDS.fengshui]) };

    // Record AI usage for analytics
    const tokensUsed = completion.usage?.total_tokens || 0;
    if (dbUserId) {
      recordAiUsage(dbUserId, "fengshui", tokensUsed).catch(() => {});
    }

    return NextResponse.json({
      reading,
      homeType,
      tokensUsed,
    });
  } catch (error) {
    console.error("Feng Shui error:", error);
    return NextResponse.json(
      { error: "Failed to generate Feng Shui analysis." },
      { status: 500 },
    );
  }
}

function buildFengShuiFallback(content: string) {
  return {
    overallScore: 7,
    overview: content,
    areas: [{ name: "General", rating: "Good", analysis: content.slice(0, 300), suggestions: ["See full analysis for detailed suggestions"] }],
    elements: { dominant: "Earth", recommendation: "Consider element balance." },
    topImprovements: ["Clear clutter", "Add plants", "Improve lighting"],
    colors: { recommended: ["Green", "Gold"], avoid: ["Red"] },
    summary: content.slice(0, 200),
  };
}
