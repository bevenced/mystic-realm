/**
 * Verify PayPal order status
 * Returns true if order is COMPLETED and not already consumed for a different service
 */

// Track which orders have been consumed and for which service
// In production, this should use a database (e.g., Vercel Postgres)
// Memory-based tracking works within a single serverless instance
const consumedOrders = new Map<string, string>();

/**
 * Check if an orderId has already been used
 */
export function isOrderConsumed(orderId: string): boolean {
  return consumedOrders.has(orderId);
}

/**
 * Get the service that consumed an orderId
 */
export function getConsumedService(orderId: string): string | undefined {
  return consumedOrders.get(orderId);
}

export async function verifyPayPalOrder(orderId: string, service: string = "unknown"): Promise<boolean> {
  try {
    // Check if already consumed for a different service
    const consumedService = consumedOrders.get(orderId);
    if (consumedService) {
      if (consumedService !== service) {
        console.warn(`Order ${orderId} already used for ${consumedService}, cannot reuse for ${service}`);
        return false;
      }
      // Same service re-requesting (e.g., page refresh) - allow but don't re-verify
      return true;
    }

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

    // Get access token with timeout
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

    // Get order details with timeout
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

    // Check if order is completed
    if (orderData.status === "COMPLETED") {
      // Mark as consumed for this service
      consumedOrders.set(orderId, service);
      return true;
    }

    console.log("PayPal order status:", orderData.status);
    return false;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("PayPal API request timed out");
    } else {
      console.error("Error verifying PayPal order:", error);
    }
    return false;
  }
}

/** Fetch with 10-second timeout */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
