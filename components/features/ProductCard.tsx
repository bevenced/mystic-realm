"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { t } = useLocale();
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;

  return (
    <div
      className="group rounded-lg overflow-hidden hover-lift animate-slide-up"
      style={{
        background: c.surface,
        border: `1px solid ${c.primary}22`,
        opacity: 0,
        animationFillMode: "forwards",
      }}
    >
      {/* Product image (emoji placeholder) */}
      <div
        className="h-44 flex items-center justify-center relative"
        style={{
          background: `linear-gradient(135deg, ${c.primary}06, ${c.primary}15)`,
        }}
      >
        <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
          {product.emoji}
        </span>
        {product.badge && (
          <span
            className="absolute top-3 left-3 text-xs px-2.5 py-0.5 rounded-full font-semibold"
            style={{
              backgroundColor: c.primary,
              color: isDark ? c.bg : "#FFFFFF",
            }}
          >
            {product.badge}
          </span>
        )}
        {product.originalPrice && (
          <span
            className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              backgroundColor: "#E74C3C",
              color: "#FFFFFF",
            }}
          >
            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs mb-1" style={{ color: c.textMuted }}>
          {product.category}
        </p>

        {/* Name */}
        <h3
          className="text-sm font-semibold mb-1.5 leading-snug"
          style={{ color: c.text }}
        >
          {product.name}
        </h3>

        {/* Description */}
        <p
          className="text-xs leading-relaxed mb-3"
          style={{
            color: c.textMuted,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.description}
        </p>

        {/* Price + Add to cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold"
              style={{ color: c.primary }}
            >
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span
                className="text-xs line-through"
                style={{ color: c.textMuted }}
              >
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{
              backgroundColor: c.primary,
              color: isDark ? c.bg : "#FFFFFF",
              boxShadow: `0 0 15px ${currentTheme.glow}`,
            }}
            title={t.common.addToCart}
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
