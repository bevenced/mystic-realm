import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { activateSubscription } from "@/lib/db";
import { verifyPayPalOrder } from "@/lib/verify-paypal-order";

const PLAN_PRICES: Record<string, number> = {
  "mystic-weekly": 2.99,
  "mystic": 9.99,
  "mystic-yearly": 99.99,
};

const activateSchema = z.object({
  orderId: z.string().min(1),
  planId: z.enum(["mystic-weekly", "mystic", "mystic-yearly"]).default("mystic"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Sign in to subscribe" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = activateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { orderId, planId } = parsed.data;

    // Verify the PayPal order was paid with correct amount
    const expectedAmount = PLAN_PRICES[planId] || 9.99;
    const isValid = await verifyPayPalOrder(orderId, `subscription:${planId}`, expectedAmount);
    if (!isValid) {
      return NextResponse.json({ error: "Payment not verified. Please complete the PayPal payment first." }, { status: 400 });
    }

    const sub = await activateSubscription(user.id, planId, orderId);

    return NextResponse.json({
      success: true,
      plan: planId,
      status: sub.status,
      expiresAt: sub.current_period_end,
    });
  } catch (error) {
    console.error("Subscription activation error:", error);
    const msg = error instanceof Error ? error.message : "Activation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
