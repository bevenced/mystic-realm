/**
 * Verify PayPal order status
 * Returns true if order is COMPLETED
 */
export async function verifyPayPalOrder(orderId: string): Promise<boolean> {
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
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("Failed to get PayPal access token");
      return false;
    }

    // Get order details
    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const orderData = await orderRes.json();
    
    // Check if order is completed
    if (orderData.status === "COMPLETED") {
      return true;
    }

    console.log("PayPal order status:", orderData.status);
    return false;
  } catch (error) {
    console.error("Error verifying PayPal order:", error);
    return false;
  }
}
