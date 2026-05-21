import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { getDeepSeek } from "@/lib/deepseek";
import { parseAiJsonResponse } from "@/lib/ai-response";
import { calculateBaZi } from "@/lib/bazi";
import { COMPATIBILITY_SYSTEM_PROMPT, buildCompatibilityPrompt, type CompatibilityResult } from "@/lib/ai-prompts-compatibility";
import { checkSubscriptionAndRateLimit } from "@/lib/subscription-check";
import { saveCompatibilityReading } from "@/lib/db";

const requestSchema = z.object({
  birthDate1: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthHour1: z.number().int().min(0).max(23),
  gender1: z.enum(["male", "female"]),
  birthDate2: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthHour2: z.number().int().min(0).max(23),
  gender2: z.enum(["male", "female"]),
  partnerName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { birthDate1, birthHour1, gender1, birthDate2, birthHour2, gender2, partnerName } = parsed.data;
    const authUser = await getAuthUser(req);
    const userId = authUser?.id || null;

    const { allowed, dbUserId, retryAfter } = await checkSubscriptionAndRateLimit(req, userId, false);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        { status: 429, headers: { "Retry-After": retryAfter || "60" } },
      );
    }

    const [y1, m1, d1] = birthDate1.split("-").map(Number);
    const [y2, m2, d2] = birthDate2.split("-").map(Number);
    const bazi1 = calculateBaZi(y1, m1, d1, birthHour1);
    const bazi2 = calculateBaZi(y2, m2, d2, birthHour2);

    const deepseek = getDeepSeek();
    if (!deepseek) {
      return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
    }

    const prompt = buildCompatibilityPrompt({
      person1: { birthDate: birthDate1, birthHour: birthHour1, gender: gender1, baziData: bazi1 },
      person2: { birthDate: birthDate2, birthHour: birthHour2, gender: gender2, baziData: bazi2 },
    });

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: COMPATIBILITY_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "";
    const analysis = (parseAiJsonResponse(content) as unknown as CompatibilityResult) || {
      overallScore: 50,
      dimensions: {
        elementalHarmony: { score: 50, analysis: "Analysis unavailable." },
        dayMasterCompatibility: { score: 50, analysis: "Analysis unavailable." },
        pillarInteraction: { score: 50, analysis: "Analysis unavailable." },
        zodiacCompatibility: { score: 50, analysis: "Analysis unavailable." },
        lifeAlignment: { score: 50, analysis: "Analysis unavailable." },
      },
      strengths: ["Analysis in progress"],
      challenges: ["Analysis in progress"],
      advice: ["Please try again later."],
      summary: "Your compatibility analysis is being generated.",
    };

    // Save reading for authenticated users
    if (dbUserId) {
      saveCompatibilityReading({
        userId: dbUserId,
        partnerName: partnerName || "Partner",
        partnerBirthDate: birthDate2,
        partnerBirthHour: birthHour2,
        partnerGender: gender2,
        score: analysis.overallScore,
        analysis,
      }).catch(() => {});
    }

    return NextResponse.json({
      person1: { baziData: bazi1, birthDate: birthDate1, birthHour: birthHour1, gender: gender1 },
      person2: { baziData: bazi2, birthDate: birthDate2, birthHour: birthHour2, gender: gender2 },
      analysis,
    });
  } catch (error) {
    console.error("Compatibility analysis error:", error);
    return NextResponse.json({ error: "Failed to generate compatibility analysis." }, { status: 500 });
  }
}
