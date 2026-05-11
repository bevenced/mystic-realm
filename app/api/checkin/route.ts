import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser, performCheckin, getTodayCheckin, getCheckinHistory, getUserPoints } from "@/lib/db";
import { getDailyFortune } from "@/lib/fortunes";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const user = await getOrCreateUser(userId);
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
    });
  } catch (error) {
    console.error("Checkin GET error:", error);
    return NextResponse.json({ error: "Failed to get check-in status" }, { status: 500 });
  }
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const user = await getOrCreateUser(userId);
    const fortune = getDailyFortune(new Date());
    const result = await performCheckin(user.id, fortune);

    return NextResponse.json({
      success: true,
      streak: result.streak,
      pointsEarned: result.points_earned,
      totalPoints: result.totalPoints,
      fortune: result.fortune,
      checkinDate: result.checkin_date,
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
