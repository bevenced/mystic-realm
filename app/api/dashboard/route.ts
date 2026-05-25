import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getDeepSeek } from "@/lib/deepseek";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user profile data
    const { getUserProfile, getUserBaZiReadings } = await import("@/lib/db");
    const profile = await getUserProfile(authUser.id);

    // Get recent readings
    const recentReadings = await getUserBaZiReadings(authUser.id, 5);

    // Generate today's fortune if user has birth info
    let todayFortune: string | null = null;
    if (profile?.birth_date) {
      try {
        const dayPillar = (await import("@/lib/bazi-engine/pillars")).getDayPillar(new Date());
        todayFortune = `Today's Day Pillar is ${dayPillar.stem}${dayPillar.branch} (${dayPillar.stemEn}). ` +
          `Your ${profile.birth_date ? "chart" : "energy"} interacts with this daily energy. ` +
          `Check your Daily Fortune for a detailed reading.`;
      } catch {}
    }

    return NextResponse.json({
      user: {
        name: profile?.name || authUser.email?.split("@")[0] || "Seeker",
        email: authUser.email,
        plan: authUser.plan || "free",
        points: authUser.points || 0,
        birthDate: profile?.birth_date || null,
      },
      recentReadings,
      todayFortune,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
