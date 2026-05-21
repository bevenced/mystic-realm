import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { performCheckin, getTodayCheckin, getCheckinHistory, getUserPoints } from "@/lib/db";
import { getDailyFortune } from "@/lib/fortunes";
import {
  generateFortune,
  generateStructuredFortune,
  tryParseStructured,
  type FortuneContext,
  type StructuredFortune,
} from "@/lib/ai-fortune";
import { calculateBaZi, getDayPillar } from "@/lib/bazi";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const todayCheckin = await getTodayCheckin(user.id);
    const points = await getUserPoints(user.id);
    const recent = await getCheckinHistory(user.id, 7);

    // Compute BaZi context for display (available even if not checked in today)
    let baziContext = null;
    if (user.birth_date) {
      const [y, m, d] = user.birth_date instanceof Date
        ? [user.birth_date.getFullYear(), user.birth_date.getMonth() + 1, user.birth_date.getDate()]
        : String(user.birth_date).split("-").map(Number);
      const bh = user.birth_hour ?? 0;
      const bazi = calculateBaZi(y, m, d, bh);
      const todayPillar = getDayPillar(new Date());
      baziContext = {
        dayMaster: `${bazi.dayMasterYinYang} ${bazi.dayMasterElement}`,
        dayMasterElement: bazi.dayMasterElement,
        dayMasterYinYang: bazi.dayMasterYinYang,
        zodiac: bazi.day.zodiac,
        elementCounts: bazi.elementCounts,
        todayStem: todayPillar.stem,
        todayBranch: todayPillar.branch,
        todayStemEn: todayPillar.stemEn,
        todayBranchEn: todayPillar.branchEn,
        todayElement: todayPillar.stemElement,
      };
    }

    // Try to parse today's fortune as structured data
    let fortuneData: StructuredFortune | null = null;
    if (todayCheckin?.fortune) {
      fortuneData = tryParseStructured(todayCheckin.fortune);
    }

    // Parse history fortunes too
    const recentHistory = recent.map((item: { checkin_date: string; streak: number; points_earned: number; fortune: string }) => ({
      checkin_date: item.checkin_date,
      streak: item.streak,
      points_earned: item.points_earned,
      fortune: item.fortune,
      fortuneData: tryParseStructured(item.fortune),
    }));

    return NextResponse.json({
      checkedIn: !!todayCheckin,
      today: todayCheckin ? {
        streak: todayCheckin.streak,
        pointsEarned: todayCheckin.points_earned,
        fortune: todayCheckin.fortune,
        fortuneData,
      } : null,
      baziContext,
      totalPoints: points,
      recentHistory,
      hasProfile: !!(user.birth_date),
    });
  } catch (error) {
    console.error("Checkin GET error:", error);
    return NextResponse.json({ error: "Failed to get check-in status" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let locale: string | undefined;
  try {
    const body = await request.json();
    locale = body.locale;
  } catch {
    // no body or invalid JSON — proceed without locale
  }

  try {
    // If user hasn't set birth info, require profile completion first
    if (!user.birth_date) {
      return NextResponse.json({
        error: "Complete your birth profile to receive personalized daily fortunes.",
        code: "PROFILE_REQUIRED",
      }, { status: 400 });
    }

    // Calculate BaZi from birth data
    const [year, month, day] = user.birth_date instanceof Date
      ? [user.birth_date.getFullYear(), user.birth_date.getMonth() + 1, user.birth_date.getDate()]
      : String(user.birth_date).split("-").map(Number);
    const birthHour = user.birth_hour ?? 0;
    const bazi = calculateBaZi(year, month, day, birthHour);

    const age = new Date().getFullYear() - year -
      (new Date() < new Date(new Date().getFullYear(), month - 1, day) ? 1 : 0);

    const fortuneContext: FortuneContext = {
      name: user.name || undefined,
      gender: user.gender || undefined,
      age,
      dayMasterElement: bazi.dayMasterElement,
      dayMasterYinYang: bazi.dayMasterYinYang,
      zodiac: bazi.day.zodiac,
      streak: 0,
      elementCounts: bazi.elementCounts,
    };

    // Today's pillar for interaction analysis
    const todayPillar = getDayPillar(new Date());

    // Try structured AI fortune first
    let fortune: string;
    let fortuneData: StructuredFortune | null = null;
    let aiGenerated = false;

    const structured = await generateStructuredFortune(fortuneContext, todayPillar, locale);
    if (structured) {
      fortuneData = structured;
      fortune = JSON.stringify(structured);
      aiGenerated = true;
    } else {
      // Fallback to single-sentence AI fortune
      const single = await generateFortune(fortuneContext, locale);
      if (single) {
        fortune = single;
        aiGenerated = true;
      } else {
        // Final fallback to fortune pool
        fortune = getDailyFortune(new Date());
      }
    }

    const result = await performCheckin(user.id, fortune);

    const baziContext = {
      dayMaster: `${bazi.dayMasterYinYang} ${bazi.dayMasterElement}`,
      dayMasterElement: bazi.dayMasterElement,
      dayMasterYinYang: bazi.dayMasterYinYang,
      zodiac: bazi.day.zodiac,
      elementCounts: bazi.elementCounts,
      todayStem: todayPillar.stem,
      todayBranch: todayPillar.branch,
      todayStemEn: todayPillar.stemEn,
      todayBranchEn: todayPillar.branchEn,
      todayElement: todayPillar.stemElement,
    };

    return NextResponse.json({
      success: true,
      streak: result.streak,
      pointsEarned: result.points_earned,
      totalPoints: result.totalPoints,
      fortune: result.fortune,
      fortuneData,
      baziContext,
      checkinDate: result.checkin_date,
      aiGenerated,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Check-in failed";
    if (msg === "Already checked in today") {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    console.error("Checkin POST error:", error);
    return NextResponse.json({
      error: `Check-in failed: ${error instanceof Error ? error.message : String(error)}`,
    }, { status: 500 });
  }
}
