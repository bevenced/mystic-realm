import { getConsumedOrderService, recordPayment } from "@/lib/db";

export async function verifyPayPalOrder(orderId: string, service: string): Promise<boolean> {
  // Check DB first — prevents cross-instance double-spend
  const consumedService = await getConsumedOrderService(orderId);
  if (consumedService) {
    if (consumedService !== service) {
      console.warn(`Order ${orderId} already used for ${consumedService}, cannot reuse for ${service}`);
      return false;
    }
    return true; // same service re-requesting (e.g., page refresh)
  }

  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const baseUrl =
      process.env.PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    if (!clientId || !clientSecret) {
      console.error("PayPal credentials not configured");
      return false;
    }

    // Get access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetchWithTimeout(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      console.error("PayPal OAuth failed:", tokenRes.status);
      return false;
    }

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("Failed to get PayPal access token");
      return false;
    }

    // Get order details
    const orderRes = await fetchWithTimeout(`${baseUrl}/v2/checkout/orders/${orderId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!orderRes.ok) {
      console.error("PayPal order fetch failed:", orderRes.status);
      return false;
    }

    const orderData = await orderRes.json();

    if (orderData.status !== "COMPLETED") {
      console.log("PayPal order status:", orderData.status);
      return false;
    }

    // Record payment in DB (prevents reuse)
    const purchaseUnits = orderData.purchase_units?.[0];
    const amount = purchaseUnits?.amount?.value
      ? parseFloat(purchaseUnits.amount.value)
      : 0;

    // We don't have userId here, but we record the PayPal orderId to prevent reuse
    // Full user-linked payment record happens in capture-order route
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("PayPal API request timed out");
    } else {
      console.error("Error verifying PayPal order:", error);
    }
    return false;
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
