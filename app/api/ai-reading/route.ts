import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { drawCards, getSpread } from "@/lib/tarot";
import { SYSTEM_PROMPT, buildUserPrompt, buildPreviewPrompt } from "@/lib/ai-prompts";
import { verifyPayPalOrder } from "@/lib/verify-paypal-order";

// Lazy-init DeepSeek client (OpenAI-compatible API)
function getDeepSeek() {
  if (!process.env.DEEPSEEK_API_KEY) return null;
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  });
}

const requestSchema = z.object({
  spreadKey: z.enum(["three-card", "five-card", "celtic-cross"]),
  question: z.string().min(3).max(500),
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

    const { spreadKey, question, orderId } = parsed.data;
    const spread = getSpread(spreadKey);

    // Verify payment if orderId is provided
    let isPaid = false;
    if (orderId) {
      isPaid = await verifyPayPalOrder(orderId);
    }

    // Draw cards
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
        { status: 503 }
      );
    }

    // Generate AI reading
    const readingPrompt = isPaid
      ? buildUserPrompt({ spreadKey, question, cards: cardData })
      : buildPreviewPrompt({ spreadKey, question, cards: cardData });

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: readingPrompt },
      ],
      max_tokens: isPaid ? 1500 : 150,
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content || "";

    // Parse AI response
    let reading;
    if (isPaid) {
      try {
        // Try to parse JSON from response (strip markdown code blocks if present)
        const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        reading = JSON.parse(jsonStr);
      } catch {
        // If JSON parsing fails, create a structured response from plain text
        reading = {
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
    } else {
      reading = { preview: content };
    }

    return NextResponse.json({
      cards: cardData,
      reading,
      spreadKey,
      spreadName: spread.name,
      question,
      tokensUsed: completion.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error("AI Reading error:", error);
    return NextResponse.json(
      { error: "Failed to generate reading. Please try again." },
      { status: 500 }
    );
  }
}
