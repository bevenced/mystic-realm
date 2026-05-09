import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getDeepSeek } from "@/lib/deepseek";
import { parseAiJsonResponse } from "@/lib/ai-response";
import { FENGSHUI_SYSTEM_PROMPT, buildFengShuiUserPrompt, buildFengShuiPreviewPrompt } from "@/lib/ai-prompts-fengshui";
import { verifyPayPalOrder } from "@/lib/verify-paypal-order";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { extractPreviewText, PREVIEW_FIELDS } from "@/lib/extract-preview";

const requestSchema = z.object({
  homeType: z.enum(["apartment", "house", "studio", "office"]),
  roomDescription: z.string().min(10).max(1000),
  concerns: z.string().max(500).default(""),
  orderId: z.string().optional(),
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

    const { homeType, roomDescription, concerns, orderId } = parsed.data;
    const { userId } = await auth();

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

    const clientIp = getClientIp(req);
    const rateKey = userId ? `ai:${userId}` : `ai:anon:${clientIp}`;
    const maxRequests = isPaid ? 20 : (userId ? 5 : 3);
    const rateResult = await checkRateLimit(rateKey, { maxRequests, windowSeconds: 60 });

    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)),
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

    return NextResponse.json({
      reading,
      homeType,
      tokensUsed: completion.usage?.total_tokens || 0,
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
