import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { MEDITATION_SYSTEM_PROMPT, buildMeditationUserPrompt, buildMeditationPreviewPrompt } from "@/lib/ai-prompts-meditation";
import { verifyPayPalOrder } from "@/lib/verify-paypal-order";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { extractPreviewText, PREVIEW_FIELDS } from "@/lib/extract-preview";

function getDeepSeek() {
  if (!process.env.DEEPSEEK_API_KEY) return null;
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  });
}

const requestSchema = z.object({
  type: z.enum(["stress", "sleep", "focus", "self-healing", "gratitude"]),
  duration: z.enum(["5", "10", "15"]).default("10"),
  mood: z.string().max(500).default(""),
  orderId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { type, duration, mood, orderId } = parsed.data;
    const { userId } = await auth();

    // Verify payment if orderId is provided (requires sign-in)
    let isPaid = false;
    if (orderId) {
      if (!userId) {
        return NextResponse.json(
          { error: "Please sign in to use paid readings." },
          { status: 401 }
        );
      }
      isPaid = await verifyPayPalOrder(orderId, "meditation");
    }

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateKey = userId ? `ai:${userId}` : `ai:anon:${clientIp}`;
    const maxRequests = isPaid ? 20 : (userId ? 5 : 3);
    const rateResult = checkRateLimit(rateKey, { maxRequests, windowSeconds: 60 });

    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const deepseek = getDeepSeek();
    if (!deepseek) {
      return NextResponse.json(
        { error: "AI service is not configured." },
        { status: 503 }
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

    let reading;
    if (isPaid) {
      try {
        const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        reading = JSON.parse(jsonStr);
      } catch {
        reading = {
          title: `${type} Meditation`,
          introduction: content,
          script: [{ phase: "core", instruction: content.slice(0, 500), duration: `${duration} minutes` }],
          breathingPattern: { name: "Deep Breathing", inhale: "4 seconds", hold: "0", exhale: "6 seconds", description: "A simple calming breath." },
          affirmations: ["I am at peace.", "I release what I cannot control.", "I embrace this moment."],
          tips: ["Find a quiet space", "Set an intention before starting"],
        };
      }
    } else {
      reading = { preview: extractPreviewText(content, [...PREVIEW_FIELDS.meditation]) };
    }

    return NextResponse.json({
      reading,
      type,
      duration,
      tokensUsed: completion.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error("Meditation error:", error);
    return NextResponse.json(
      { error: "Failed to generate meditation." },
      { status: 500 }
    );
  }
}
