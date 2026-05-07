import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createOrderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  spreadKey: z.string(),
  readingId: z.string().optional(),
});

// Get PayPal access token
async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
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
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { amount, currency, spreadKey, readingId } = parsed.data;

    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "Payment service is not configured." },
        { status: 503 }
      );
    }

    const accessToken = await getAccessToken();

    const baseUrl =
      process.env.PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    const serviceNames: Record<string, string> = {
      "three-card": "3-Card Tarot Reading",
      "five-card": "5-Card Week Ahead Reading",
      "celtic-cross": "10-Card Celtic Cross Reading",
      tarot: "AI Tarot Reading",
      bazi: "BaZi Destiny Analysis",
      fengshui: "Feng Shui Consultation",
      astrology: "Natal Chart Reading",
      meditation: "Guided Meditation",
    };

    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            description: serviceNames[spreadKey] || "AI Mystical Service",
            custom_id: readingId || "",
          },
        ],
      }),
    });

    const orderData = await orderRes.json();

    if (!orderData.id) {
      console.error("PayPal order creation failed:", orderData);
      return NextResponse.json(
        { error: "Failed to create payment order." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: orderData.id,
      status: orderData.status,
    });
  } catch (error) {
    console.error("PayPal create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment. Please try again." },
      { status: 500 }
    );
  }
}
