import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const captureSchema = z.object({
  orderId: z.string().min(1),
});

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
    const parsed = captureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { orderId } = parsed.data;

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
    const amount = payment?.amount?.value;
    const currency = payment?.amount?.currency_code;

    return NextResponse.json({
      success: true,
      orderId,
      amount,
      currency,
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
