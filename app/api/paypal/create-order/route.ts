import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { validateServicePrice, FIRST_TIME_PRICE } from "@/lib/pricing";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const createOrderSchema = z.object({
  currency: z.string().default("USD"),
  serviceKey: z.string(),
  readingId: z.string().optional(),
  isFirstReading: z.boolean().optional(),
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

  const authStr = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authStr}`,
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

    const { currency, serviceKey, readingId, isFirstReading } = parsed.data;

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateResult = await checkRateLimit(`paypal:create:${clientIp}`, { maxRequests: 10, windowSeconds: 3600 });
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)) } }
      );
    }

    // Validate service and determine price
    const priceValidation = validateServicePrice(serviceKey);
    if (!priceValidation.valid) {
      return NextResponse.json(
        { error: "Invalid service type." },
        { status: 400 }
      );
    }

    // Apply first-time discount if applicable
    let amount = priceValidation.expectedPrice;
    let appliedDiscount = false;

    if (isFirstReading) {
      const discountUser = await getAuthUser(req);
      if (discountUser) {
        try {
          const { sql } = await import("@vercel/postgres");
          const result = await sql`SELECT COUNT(*) as count FROM payments WHERE user_id = ${discountUser.id}`;
          const count = parseInt(result.rows[0]?.count || "0", 10);
          if (count === 0) {
            amount = FIRST_TIME_PRICE;
            appliedDiscount = true;
          }
        } catch {
          amount = FIRST_TIME_PRICE;
          appliedDiscount = true;
        }
      } else {
        amount = FIRST_TIME_PRICE;
        appliedDiscount = true;
      }
    }

    const serviceName = priceValidation.serviceName;
    const customId = appliedDiscount ? `${serviceKey}:first` : serviceKey;

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
              breakdown: appliedDiscount ? {
                item_total: { currency_code: currency, value: amount.toFixed(2) },
                discount: { currency_code: currency, value: (priceValidation.expectedPrice - amount).toFixed(2) },
              } : undefined,
            },
            description: appliedDiscount ? `${serviceName} (First Reading Special)` : serviceName,
            custom_id: customId,
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
      amount,
      serviceKey,
      appliedDiscount,
      originalPrice: appliedDiscount ? priceValidation.expectedPrice : undefined,
    });
  } catch (error) {
    console.error("PayPal create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment. Please try again." },
      { status: 500 }
    );
  }
}
