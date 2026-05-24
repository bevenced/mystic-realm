import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { getDeepSeek } from "@/lib/deepseek";
import { parseAiJsonResponse } from "@/lib/ai-response";
import { calculateBaZi, type BaZiResult } from "@/lib/bazi";
import { BAZI_SYSTEM_PROMPT, buildBaZiUserPrompt, buildBaZiPreviewPrompt } from "@/lib/ai-prompts-bazi";
import { verifyPayPalOrder } from "@/lib/verify-paypal-order";
import { extractPreviewText, PREVIEW_FIELDS } from "@/lib/extract-preview";
import { getLocaleInstruction } from "@/lib/ai-locale";
import { checkSubscriptionAndRateLimit } from "@/lib/subscription-check";
import { recordAiUsage, consumeRedemption } from "@/lib/db";

// Professional engine imports
import { getAllTenGods } from "@/lib/bazi-engine/ten-gods";
import { calculateElementStrength } from "@/lib/bazi-engine/elements";
import { getAllHiddenStems } from "@/lib/bazi-engine/hidden-stems";
import { calculateShenSha } from "@/lib/bazi-engine/shensha";
import { calculateDaYun, getCurrentDaYun } from "@/lib/bazi-engine/luck";
import { getCurrentYearFortune } from "@/lib/bazi-engine/annual";
import { getNaYin } from "@/lib/bazi-engine/nayin";

const requestSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthHour: z.number().int().min(0).max(23),
  gender: z.enum(["male", "female"]),
  reportType: z.enum(["preview", "full", "annual", "personality", "deep"]).default("preview"),
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

    const { birthDate, birthHour, gender, reportType, orderId, redeemed, locale } = parsed.data;
    const authUser = await getAuthUser(req);
    const userId = authUser?.id || null;

    const needsPayment = reportType !== "preview";

    let isPaid = false;
    if (needsPayment) {
      if (!userId) {
        return NextResponse.json(
          { error: "Please sign in to use paid readings." },
          { status: 401 },
        );
      }
      if (orderId) {
        isPaid = await verifyPayPalOrder(orderId, `bazi-${reportType}`);
      }
      if (redeemed && userId) {
        const redemption = await consumeRedemption(redeemed);
        if (redemption) isPaid = true;
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

    const [year, month, day] = birthDate.split("-").map(Number);
    const baziData = calculateBaZi(year, month, day, birthHour);

    const deepseek = getDeepSeek();
    if (!deepseek) {
      return NextResponse.json(
        { error: "AI service is not configured." },
        { status: 503 },
      );
    }

    // Build extended professional analysis data
    let professionalData = null;
    if (isPaid) {
      const pillarStems = [
        baziData.year.stemIndex,
        baziData.month.stemIndex,
        baziData.day.stemIndex,
        baziData.hour.stemIndex,
      ];
      const pillarBranches = [
        baziData.year.branchIndex,
        baziData.month.branchIndex,
        baziData.day.branchIndex,
        baziData.hour.branchIndex,
      ];

      const tenGods = getAllTenGods(baziData.dayMasterIndex, pillarStems);
      const elementStrength = calculateElementStrength(
        pillarStems, pillarBranches, baziData.dayMasterIndex, true
      );
      const hiddenStems = getAllHiddenStems(pillarBranches);
      const shensha = calculateShenSha(
        pillarStems[0], pillarBranches[0],
        pillarStems[1], pillarBranches[1],
        pillarStems[2], pillarBranches[2],
        pillarStems[3], pillarBranches[3],
        gender
      );
      const daYun = calculateDaYun(
        new Date(year, month - 1, day, birthHour),
        baziData.year.stemIndex,
        pillarStems[1], pillarBranches[1],
        gender
      );
      const currentYearFortune = getCurrentYearFortune(
        baziData.dayMasterIndex,
        baziData.year.stemIndex,
        baziData.year.branchIndex
      );
      const nayin = ["Year", "Month", "Day", "Hour"].map((name, i) => ({
        pillar: name,
        ...getNaYin(pillarStems[i], pillarBranches[i]),
      }));

      professionalData = {
        tenGods: tenGods.map(tg => ({
          stem: tg.stem,
          tenGodName: tg.tenGodName,
          tenGodEn: tg.tenGodEn,
          element: tg.element,
          relationship: tg.relationship,
        })),
        elementStrength,
        hiddenStems: hiddenStems.map(hs => ({
          branchIndex: hs.branchIndex,
          stems: hs.stems.map(s => ({ stem: s.stem, element: s.element, qi: s.qi })),
        })),
        shensha: shensha.map(ss => ({
          name: ss.name,
          nameEn: ss.nameEn,
          type: ss.type,
          description: ss.description,
          locations: ss.locations,
        })),
        daYun,
        currentYearFortune,
        nayin,
      };
    }

    const isPaidFull = isPaid && needsPayment;
    const prompt = isPaidFull
      ? buildBaZiUserPrompt({
          birthDate,
          birthHour,
          gender,
          baziData,
          ...(professionalData || {}),
        }, reportType)
      : buildBaZiPreviewPrompt({ birthDate, birthHour, gender, baziData });

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: BAZI_SYSTEM_PROMPT + "\n\n" + getLocaleInstruction(locale || "en") },
        { role: "user", content: prompt },
      ],
      max_tokens: isPaidFull ? 2000 : 150,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "";
    const reading = isPaidFull
      ? parseAiJsonResponse(content) || buildBaZiFallback(content, baziData)
      : { preview: extractPreviewText(content, [...PREVIEW_FIELDS.bazi]) };

    const tokensUsed = completion.usage?.total_tokens || 0;
    if (dbUserId) {
      recordAiUsage(dbUserId, "bazi", tokensUsed).catch(() => {});
    }

    return NextResponse.json({
      baziData,
      reading,
      professionalData, // Full professional analysis data for paid users
      birthDate,
      birthHour,
      gender,
      tokensUsed,
    });
  } catch (error) {
    console.error("BaZi Reading error:", error);
    return NextResponse.json(
      { error: "Failed to generate BaZi reading." },
      { status: 500 },
    );
  }
}

function buildBaZiFallback(content: string, baziData: BaZiResult) {
  return {
    overview: content,
    dayMaster: `Your Day Master is ${baziData.dayMasterYinYang} ${baziData.dayMasterElement}.`,
    elementAnalysis: { dominant: baziData.dayMasterElement, lacking: "N/A", balance: "See full analysis." },
    pillars: [
      { name: "Year Pillar", stem: baziData.year.stem, branch: baziData.year.branch, hiddenStems: "", tenGod: "", meaning: "Ancestral and social influences." },
      { name: "Month Pillar", stem: baziData.month.stem, branch: baziData.month.branch, hiddenStems: "", tenGod: "", meaning: "Career and parental influences." },
      { name: "Day Pillar", stem: baziData.day.stem, branch: baziData.day.branch, hiddenStems: "", tenGod: "", meaning: "Self and spousal relationships." },
      { name: "Hour Pillar", stem: baziData.hour.stem, branch: baziData.hour.branch, hiddenStems: "", tenGod: "", meaning: "Hidden talents and aspirations." },
    ],
    lifeAspects: { personality: content.slice(0, 200), career: "Full analysis requires payment.", relationships: "Full analysis requires payment.", health: "Full analysis requires payment." },
    advice: "Consider the full reading for detailed guidance.",
    luckyElements: [baziData.dayMasterElement],
    affirmation: "I embrace my unique cosmic blueprint.",
  };
}
