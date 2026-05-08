import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { calculateBaZi } from "@/lib/bazi";
import { BAZI_SYSTEM_PROMPT, buildBaZiUserPrompt, buildBaZiPreviewPrompt } from "@/lib/ai-prompts-bazi";
import { verifyPayPalOrder } from "@/lib/verify-paypal-order";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function getDeepSeek() {
  if (!process.env.DEEPSEEK_API_KEY) return null;
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  });
}

const requestSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthHour: z.number().int().min(0).max(23),
  gender: z.enum(["male", "female"]),
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

    const { birthDate, birthHour, gender, orderId } = parsed.data;
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
      isPaid = await verifyPayPalOrder(orderId, "bazi");
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

    // Calculate BaZi
    const [year, month, day] = birthDate.split("-").map(Number);
    const baziData = calculateBaZi(year, month, day, birthHour);

    const deepseek = getDeepSeek();
    if (!deepseek) {
      return NextResponse.json(
        { error: "AI service is not configured." },
        { status: 503 }
      );
    }

    const prompt = isPaid
      ? buildBaZiUserPrompt({ birthDate, birthHour, gender, baziData })
      : buildBaZiPreviewPrompt({ birthDate, birthHour, gender, baziData });

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: BAZI_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: isPaid ? 2000 : 150,
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
          overview: content,
          dayMaster: `Your Day Master is ${baziData.dayMasterYinYang} ${baziData.dayMasterElement}.`,
          elementAnalysis: { dominant: baziData.dayMasterElement, lacking: "N/A", balance: "See full analysis." },
          pillars: [
            { name: "Year Pillar", meaning: "Ancestral and social influences." },
            { name: "Month Pillar", meaning: "Career and parental influences." },
            { name: "Day Pillar", meaning: "Self and spousal relationships." },
            { name: "Hour Pillar", meaning: "Hidden talents and aspirations." },
          ],
          lifeAspects: { personality: content.slice(0, 200), career: "Full analysis requires payment.", relationships: "Full analysis requires payment.", health: "Full analysis requires payment." },
          advice: "Consider the full reading for detailed guidance.",
          luckyElements: [baziData.dayMasterElement],
          affirmation: "I embrace my unique cosmic blueprint.",
        };
      }
    } else {
      try {
        const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(jsonStr);
        const previewText = parsed.overview || parsed.dayMaster || parsed.summary
          || (parsed.lifeAspects && typeof parsed.lifeAspects === "object" && (parsed.lifeAspects as Record<string, string>).personality)
          || JSON.stringify(parsed);
        reading = { preview: typeof previewText === "string" ? previewText : JSON.stringify(previewText) };
      } catch {
        reading = { preview: content };
      }
    }

    return NextResponse.json({
      baziData,
      reading,
      birthDate,
      birthHour,
      gender,
      tokensUsed: completion.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error("BaZi Reading error:", error);
    return NextResponse.json(
      { error: "Failed to generate BaZi reading." },
      { status: 500 }
    );
  }
}
