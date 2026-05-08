"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  amount: number;
  spreadKey: string;
  readingId: string;
  onSuccess: (orderId: string) => void;
  onError: (msg: string) => void;
}

export default function PayPalButton({
  amount,
  spreadKey,
  readingId,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div
        className="rounded-xl p-4 text-center"
        style={{ background: `${c.primary}10`, border: `1px solid ${c.primary}33` }}
      >
        <p className="text-sm" style={{ color: c.textMuted }}>
          Payment is not configured yet. Please set NEXT_PUBLIC_PAYPAL_CLIENT_ID.
        </p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <div
        className="rounded-xl p-6 mt-6"
        style={{
          background: c.surface,
          border: `1px solid ${c.primary}33`,
        }}
      >
        <div className="text-center mb-4">
          <p className="text-xs tracking-wider uppercase mb-1" style={{ color: c.textMuted }}>
            Unlock Full Reading
          </p>
          <p className="text-2xl font-bold" style={{ color: c.primary }}>
            ${amount.toFixed(2)}
          </p>
        </div>

        <PayPalButtons
          style={{
            layout: "vertical",
            color: currentTheme.isDark ? "blue" : "gold",
            shape: "rect",
            label: "pay",
            height: 42,
          }}
          createOrder={async () => {
            try {
              const res = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currency: "USD", serviceKey: spreadKey, readingId }),
              });
              const data = await res.json();
              if (data.error) {
                onError(data.error);
                return "";
              }
              return data.orderId;
            } catch (err) {
              onError("Failed to create payment. Please try again.");
              return "";
            }
          }}
          onApprove={async (data) => {
            try {
              const res = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: data.orderID }),
              });
              const result = await res.json();
              if (result.success) {
                onSuccess(data.orderID);
              } else {
                onError(result.error || "Payment failed.");
              }
            } catch (err) {
              onError("Failed to process payment. Please try again.");
            }
          }}
          onError={() => {
            onError("An error occurred with PayPal. Please try again.");
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}
