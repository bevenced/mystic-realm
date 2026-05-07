import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { calculateBaZi } from "@/lib/bazi";
import { BAZI_SYSTEM_PROMPT, buildBaZiUserPrompt, buildBaZiPreviewPrompt } from "@/lib/ai-prompts-bazi";
import { verifyPayPalOrder } from "@/lib/verify-paypal-order";

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
  orderId: z.string().optional(), // PayPal order ID for paid readings
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

    // Verify payment if orderId is provided
    let isPaid = false;
    if (orderId) {
      isPaid = await verifyPayPalOrder(orderId);
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
      reading = { preview: content };
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
