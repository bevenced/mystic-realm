"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  amount: number;
  spreadKey: string;
  readingId: string;
  isFirstReading?: boolean;
  onSuccess: (orderId: string) => void;
  onError: (msg: string) => void;
}

export default function PayPalButton({
  amount,
  spreadKey,
  readingId,
  isFirstReading = false,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const discountPrice = isFirstReading ? 1.99 : amount;

  if (!clientId) {
    return (
      <div
        className="rounded-xl p-4 text-center"
        style={{ background: `${c.primary}08`, border: `1px solid ${c.primary}22` }}
      >
        <p className="text-xs tracking-wider uppercase mb-1" style={{ color: c.textMuted }}>
          Full Reading
        </p>
        <p className="text-sm" style={{ color: c.textMuted }}>
          ${discountPrice.toFixed(2)} — coming soon
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
          background: `linear-gradient(135deg, ${c.primary}12 0%, ${c.surface} 100%)`,
          border: isFirstReading ? `2px solid ${c.primary}44` : `1px solid ${c.primary}33`,
        }}
      >
        {isFirstReading && (
          <div
            className="text-center mb-2"
          >
            <span
              className="inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-2"
              style={{
                background: c.primary,
                color: isDark ? c.bg : "#FFFFFF",
              }}
            >
              🎉 First Reading Special
            </span>
          </div>
        )}

        <div className="text-center mb-4">
          <p className="text-xs tracking-wider uppercase mb-1" style={{ color: c.textMuted }}>
            {isFirstReading ? "Your first full reading — just" : "Unlock Full Reading"}
          </p>
          <div className="flex items-center justify-center gap-2">
            {isFirstReading && (
              <span
                className="text-lg line-through"
                style={{ color: c.textMuted }}
              >
                ${amount.toFixed(2)}
              </span>
            )}
            <p className="text-2xl font-bold" style={{ color: c.primary }}>
              ${discountPrice.toFixed(2)}
            </p>
          </div>
          {isFirstReading && (
            <p className="text-[10px] mt-1" style={{ color: c.textMuted }}>
              Limited to one first-time reading per user
            </p>
          )}
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
                body: JSON.stringify({
                  currency: "USD",
                  serviceKey: spreadKey,
                  readingId,
                  isFirstReading,
                }),
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
