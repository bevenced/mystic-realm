import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { SERVICE_PRICES } from "@/lib/pricing";

const captureSchema = z.object({
  orderId: z.string().min(1),
});

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }
  const baseUrl =
    process.env.PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error("Failed to get PayPal access token");
  }
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = captureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { orderId } = parsed.data;
    const { userId } = await auth();

    // Rate limiting: max 10 captures per IP per hour
    const clientIp = getClientIp(req);
    const rateResult = checkRateLimit(`paypal:capture:${clientIp}`, { maxRequests: 10, windowSeconds: 3600 });
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)) } }
      );
    }

    const accessToken = await getAccessToken();

    const baseUrl =
      process.env.PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    const captureRes = await fetch(
      `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const captureData = await captureRes.json();

    if (captureData.status !== "COMPLETED") {
      console.error("PayPal capture failed:", captureData);
      return NextResponse.json(
        { error: "Payment not completed.", status: captureData.status },
        { status: 400 }
      );
    }

    // Extract payment details
    const payment = captureData.purchase_units?.[0];
    const capturedAmount = parseFloat(payment?.amount?.value || "0");
    const currency = payment?.amount?.currency_code;
    const serviceKey = payment?.custom_id || "";

    // Verify amount matches server-side price (log mismatch but still complete)
    const expectedPrice = SERVICE_PRICES[serviceKey];
    let serviceVerified = false;
    if (expectedPrice) {
      serviceVerified = Math.abs(capturedAmount - expectedPrice) < 0.01;
      if (!serviceVerified) {
        console.error(`Amount mismatch: captured $${capturedAmount}, expected $${expectedPrice} for ${serviceKey}`);
      }
    }

    // Record payment to database if user is logged in
    if (userId) {
      try {
        const { getOrCreateUser, recordPayment } = await import("@/lib/db");
        const user = await getOrCreateUser(userId);
        await recordPayment(user.id, {
          paypalOrderId: orderId,
          amount: capturedAmount,
          currency,
          service: serviceKey,
          status: "completed",
        });
      } catch (dbError) {
        // Don't fail the payment response if DB recording fails
        console.error("Failed to record payment to DB:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount: capturedAmount,
      currency,
      serviceKey,
      serviceVerified,
      payerEmail: captureData.payer?.email_address,
      status: captureData.status,
    });
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.json(
      { error: "Failed to process payment." },
      { status: 500 }
    );
  }
}
