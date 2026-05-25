import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { addUserPoints, getUserPoints } from "@/lib/db";
import { sql } from "@/lib/sql";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    // Check if already earned share points today
    const today = new Date().toISOString().slice(0, 10);
    const existing = await sql`
      SELECT id FROM points_transactions
      WHERE user_id = ${user.id} AND type = 'share' AND created_at::date = ${today}::date
      LIMIT 1
    `;

    if (existing.rows.length > 0) {
      const points = await getUserPoints(user.id);
      return NextResponse.json({
        success: false,
        alreadyEarned: true,
        message: "Share bonus already earned today. Come back tomorrow!",
        totalPoints: points,
      });
    }

    const points = await addUserPoints(user.id, 5, "share", "Fortune card share bonus");

    return NextResponse.json({
      success: true,
      pointsEarned: 5,
      totalPoints: points,
      message: "Thanks for sharing! +5 points.",
    });
  } catch (error) {
    console.error("Share points error:", error);
    return NextResponse.json({ error: "Failed to award share points" }, { status: 500 });
  }
}
