"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { products, type Product } from "@/lib/products";

// Map service types to relevant product themes
const SERVICE_PRODUCT_MAP: Record<string, string[]> = {
  tarot: ["tarot"],
  bazi: ["bazi"],
  fengshui: ["fengshui"],
  astrology: ["astrology"],
  meditation: ["meditation"],
  healing: ["healing"],
  "three-card": ["tarot"],
  "five-card": ["tarot"],
  "celtic-cross": ["tarot"],
};

interface ServiceProductRecommendationsProps {
  service: string;
}

export default function ServiceProductRecommendations({ service }: ServiceProductRecommendationsProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;

  // Find matching products
  const themes = SERVICE_PRODUCT_MAP[service] || [];
  const recommendations = products
    .filter((p) => themes.includes(p.theme))
    .slice(0, 3); // Max 3 recommendations

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-10 animate-slide-up">
      <div className="w-12 h-px mx-auto mb-6" style={{ background: `${c.primary}33` }} />

      <h3 className="text-sm font-semibold tracking-wider uppercase text-center mb-2" style={{ color: c.primary }}>
        Enhance Your Practice
      </h3>
      <p className="text-xs text-center mb-6" style={{ color: c.textMuted }}>
        Handpicked products to complement your {service} journey
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recommendations.map((product) => (
          <ProductRecommendationCard key={product.id} product={product} themeColors={c} isDark={isDark} />
        ))}
      </div>
    </div>
  );
}

function ProductRecommendationCard({
  product,
  themeColors: c,
  isDark,
}: {
  product: Product;
  themeColors: Record<string, string>;
  isDark: boolean;
}) {
  return (
    <a
      href={`/shop?theme=${product.theme}`}
      className="block rounded-xl p-4 transition-all hover:scale-[1.02]"
      style={{
        background: `${c.primary}08`,
        border: `1px solid ${c.primary}15`,
      }}
    >
      <div className="text-center mb-2">
        <span className="text-2xl">{product.emoji}</span>
      </div>
      <p className="text-sm font-semibold text-center mb-1" style={{ color: c.text }}>
        {product.name}
      </p>
      <p className="text-xs text-center leading-relaxed line-clamp-2" style={{ color: c.textMuted }}>
        {product.description}
      </p>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className="text-sm font-bold" style={{ color: c.primary }}>
          ${product.price.toFixed(2)}
        </span>
        {product.originalPrice && (
          <span className="text-xs line-through" style={{ color: c.textMuted }}>
            ${product.originalPrice.toFixed(2)}
          </span>
        )}
      </div>
    </a>
  );
}
