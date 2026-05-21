"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import type { Product } from "@/lib/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void | Promise<void>;
  checkoutLoading?: boolean;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  checkoutLoading = false,
}: CartDrawerProps) {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div
        className="fixed top-0 right-0 z-[70] h-full w-full max-w-md shadow-2xl animate-slide-down"
        style={{
          background: c.bg,
          borderLeft: `1px solid ${c.primary}22`,
          transform: "translateX(0)",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            borderBottom: `1px solid ${c.primary}15`,
          }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} style={{ color: c.primary }} />
            <h2 className="text-lg font-semibold" style={{ color: c.text }}>
              {t.cart.title} ({itemCount})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              color: c.textMuted,
              backgroundColor: `${c.primary}08`,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: "calc(100vh - 200px)" }}>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ShoppingBag size={48} style={{ color: c.textMuted, opacity: 0.3 }} />
              <p className="mt-4 text-sm" style={{ color: c.textMuted }}>
                {t.cart.empty}
              </p>
              <button
                onClick={onClose}
                className="mt-4 text-sm font-medium"
                style={{ color: c.primary }}
              >
                {t.cart.continueShopping}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-4 p-3 rounded-lg"
                  style={{
                    background: c.surface,
                    border: `1px solid ${c.primary}10`,
                  }}
                >
                  <span className="text-3xl flex-shrink-0">{item.product.emoji}</span>

                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-sm font-semibold truncate"
                      style={{ color: c.text }}
                    >
                      {item.product.name}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                      ${item.product.price.toFixed(2)} {t.cart.each}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-xs transition-colors"
                        style={{
                          border: `1px solid ${c.primary}33`,
                          color: c.textMuted,
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-medium" style={{ color: c.text }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-xs transition-colors"
                        style={{
                          border: `1px solid ${c.primary}33`,
                          color: c.textMuted,
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="text-xs transition-colors"
                      style={{ color: "#E74C3C" }}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                    <span className="text-sm font-bold" style={{ color: c.primary }}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div
            className="px-6 py-4"
            style={{
              borderTop: `1px solid ${c.primary}15`,
              background: c.surface,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm" style={{ color: c.textMuted }}>
                {t.cart.subtotal}
              </span>
              <span className="text-xl font-bold" style={{ color: c.primary }}>
                ${total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              disabled={checkoutLoading}
              className="w-full py-3 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: c.primary,
                color: isDark ? c.bg : "#FFFFFF",
                boxShadow: `0 0 20px ${currentTheme.glow}`,
                opacity: checkoutLoading ? 0.7 : 1,
              }}
            >
              {checkoutLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {t.cart.processing}
                </>
              ) : (
                t.cart.checkout
              )}
            </button>
            <p className="text-xs text-center mt-2" style={{ color: c.textMuted }}>
              {t.cart.securePayment}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
