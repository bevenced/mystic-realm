import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser, getActiveSubscription, getUserMonthlyUsage, getUserPoints } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const user = await getOrCreateUser(userId);
    const sub = await getActiveSubscription(user.id);
    const usage = await getUserMonthlyUsage(user.id);
    const points = await getUserPoints(user.id);

    const isActive = !!(sub && sub.status === "active");

    return NextResponse.json({
      plan: isActive ? sub.plan_id : "free",
      planName: isActive ? sub.plan_name : "Free",
      isActive,
      expiresAt: sub?.current_period_end || null,
      features: sub?.features || ["3 free previews per service", "Basic AI guidance"],
      readingsLimit: sub?.ai_credits_per_month || 3,
      readingsThisMonth: usage.readings,
      totalPoints: points,
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    return NextResponse.json({ error: "Failed to get subscription status" }, { status: 500 });
  }
}
