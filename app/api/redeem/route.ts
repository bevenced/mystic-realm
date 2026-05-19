import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { redeemPoints, getUserPoints, createRedemption } from "@/lib/db";

const REDEEM_COST = 100;

const redeemSchema = z.object({
  service: z.enum(["reading", "bazi", "astrology", "fengshui", "meditation"]).default("reading"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Sign in to redeem points" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = redeemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { service } = parsed.data;
    const currentPoints = await getUserPoints(user.id);

    if (currentPoints < REDEEM_COST) {
      return NextResponse.json({
        error: `积分不足，您有 ${currentPoints}，需要 ${REDEEM_COST}。`,
        currentPoints,
      }, { status: 400 });
    }

    // Deduct points and create one-time redemption token
    await redeemPoints(user.id, REDEEM_COST);
    const token = await createRedemption(user.id, service);
    const remainingPoints = await getUserPoints(user.id);

    return NextResponse.json({
      success: true,
      token,
      pointsRedeemed: REDEEM_COST,
      remainingPoints,
      service,
      message: "已兑换 100 积分，可用于一次深度解读。将 token 传递给 AI 端点即可使用。",
    });
  } catch (error) {
    console.error("Redeem error:", error);
    const msg = error instanceof Error ? error.message : "Redemption failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
