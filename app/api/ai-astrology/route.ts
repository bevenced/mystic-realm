import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { calculateZodiac } from "@/lib/astrology";
import { ASTROLOGY_SYSTEM_PROMPT, buildAstrologyUserPrompt, buildAstrologyPreviewPrompt } from "@/lib/ai-prompts-astrology";
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

    const { birthDate, birthHour, orderId } = parsed.data;

    // Verify payment if orderId is provided
    let isPaid = false;
    if (orderId) {
      isPaid = await verifyPayPalOrder(orderId);
    }

    // Calculate zodiac
    const [year, month, day] = birthDate.split("-").map(Number);
    const zodiacData = calculateZodiac(year, month, day, birthHour);

    const deepseek = getDeepSeek();
    if (!deepseek) {
      return NextResponse.json(
        { error: "AI service is not configured." },
        { status: 503 }
      );
    }

    const prompt = isPaid
      ? buildAstrologyUserPrompt({ birthDate, birthHour, zodiacData })
      : buildAstrologyPreviewPrompt({ birthDate, birthHour, zodiacData });

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: ASTROLOGY_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: isPaid ? 2000 : 150,
      temperature: 0.8,
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
    } else {
      reading = { preview: content };
    }

    return NextResponse.json({
      zodiacData,
      reading,
      birthDate,
      birthHour,
      tokensUsed: completion.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error("Astrology error:", error);
    return NextResponse.json(
      { error: "Failed to generate astrology reading." },
      { status: 500 }
    );
  }
}
