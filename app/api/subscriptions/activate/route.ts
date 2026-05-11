import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser, activateSubscription } from "@/lib/db";
import { verifyPayPalOrder } from "@/lib/verify-paypal-order";

const activateSchema = z.object({
  orderId: z.string().min(1),
  planId: z.enum(["mystic"]).default("mystic"),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Sign in to subscribe" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = activateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { orderId, planId } = parsed.data;

    // Verify the PayPal order was paid with correct amount
    const isValid = await verifyPayPalOrder(orderId, `subscription:${planId}`, 9.99);
    if (!isValid) {
      return NextResponse.json({ error: "Payment not verified. Please complete the PayPal payment first." }, { status: 400 });
    }

    const user = await getOrCreateUser(userId);
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
