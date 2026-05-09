import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const shopOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().min(1),
  })).min(1).max(20),
  currency: z.string().default("USD"),
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
    const parsed = shopOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, currency } = parsed.data;

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateResult = await checkRateLimit(`paypal:shop:${clientIp}`, { maxRequests: 10, windowSeconds: 3600 });
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)) } }
      );
    }

    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "Payment service is not configured." },
        { status: 503 }
      );
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Build item descriptions
    const itemDescriptions = items.map(i => `${i.quantity}x ${i.name}`).join(", ");
    const description = itemDescriptions.length > 127
      ? itemDescriptions.slice(0, 124) + "..."
      : itemDescriptions;

    const accessToken = await getAccessToken();

    const baseUrl =
      process.env.PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

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
              value: total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: currency,
                  value: total.toFixed(2),
                },
              },
            },
            description: `Mystic Realm Shop: ${description}`,
            custom_id: "shop-order",
            items: items.map(item => ({
              name: item.name,
              unit_amount: {
                currency_code: currency,
                value: item.price.toFixed(2),
              },
              quantity: String(item.quantity),
              category: "PHYSICAL_GOODS",
            })),
          },
        ],
      }),
    });

    const orderData = await orderRes.json();

    if (!orderData.id) {
      console.error("PayPal shop order creation failed:", orderData);
      return NextResponse.json(
        { error: "Failed to create payment order." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: orderData.id,
      status: orderData.status,
      amount: total,
      isLive: process.env.PAYPAL_MODE === "live",
    });
  } catch (error) {
    console.error("PayPal shop order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment. Please try again." },
      { status: 500 }
    );
  }
}
