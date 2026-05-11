import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { performCheckin, getTodayCheckin, getCheckinHistory, getUserPoints } from "@/lib/db";
import { getDailyFortune } from "@/lib/fortunes";
import { generateFortune, type FortuneContext } from "@/lib/ai-fortune";
import { calculateBaZi } from "@/lib/bazi";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const todayCheckin = await getTodayCheckin(user.id);
    const points = await getUserPoints(user.id);
    const recent = await getCheckinHistory(user.id, 7);

    return NextResponse.json({
      checkedIn: !!todayCheckin,
      today: todayCheckin ? {
        streak: todayCheckin.streak,
        pointsEarned: todayCheckin.points_earned,
        fortune: todayCheckin.fortune,
      } : null,
      totalPoints: points,
      recentHistory: recent,
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

  try {
    // If user hasn't set birth info, require profile completion first
    if (!user.birth_date) {
      return NextResponse.json({
        error: "Complete your birth profile to receive personalized daily fortunes.",
        code: "PROFILE_REQUIRED",
      }, { status: 400 });
    }

    // Calculate BaZi and generate AI fortune
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

    let fortune = await generateFortune(fortuneContext);
    const aiGenerated = !!fortune;

    // Fallback to fortune pool if AI fails
    if (!fortune) {
      fortune = getDailyFortune(new Date());
    }

    const result = await performCheckin(user.id, fortune);

    return NextResponse.json({
      success: true,
      streak: result.streak,
      pointsEarned: result.points_earned,
      totalPoints: result.totalPoints,
      fortune: result.fortune,
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
