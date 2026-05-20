"use client";

import { spreads, type SpreadConfig } from "@/lib/tarot";
import { useTheme } from "@/components/theme/ThemeProvider";

interface TarotSpreadSelectorProps {
  selected: string;
  onSelect: (key: string) => void;
}

export default function TarotSpreadSelector({ selected, onSelect }: TarotSpreadSelectorProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {spreads.map((spread) => {
        const isSelected = selected === spread.key;
        return (
          <button
            key={spread.key}
            onClick={() => onSelect(spread.key)}
            className="group text-left rounded-lg overflow-hidden hover-lift animate-slide-up"
            style={{
              opacity: 0,
              animationDelay: `${spreads.indexOf(spread) * 100}ms`,
              animationFillMode: "forwards",
              background: c.surface,
              border: isSelected
                ? `2px solid ${c.primary}`
                : `1px solid ${c.primary}33`,
              boxShadow: isSelected ? `0 0 20px ${currentTheme.glow}` : "none",
            }}
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="text-base font-semibold theme-transition"
                  style={{ color: c.primary }}
                >
                  {spread.name}
                </h3>
                <span
                  className="text-xs px-2 py-1 rounded-full theme-transition"
                  style={{
                    backgroundColor: isSelected ? c.primary : `${c.primary}15`,
                    color: isSelected ? c.bg : c.primary,
                  }}
                >
                  ${spread.price}
                </span>
              </div>

              {/* Chinese name */}
              <p
                className="text-xs mb-2 theme-transition"
                style={{ color: c.textMuted, opacity: 0.6 }}
              >
                <span lang="zh">{spread.nameZh}</span> &middot; {spread.cardCount} Cards
              </p>

              {/* Positions preview */}
              <p
                className="text-xs leading-relaxed mb-3 theme-transition"
                style={{ color: c.textMuted }}
              >
                {spread.description}
              </p>

              {/* Position chips */}
              <div className="flex flex-wrap gap-1">
                {spread.positions.slice(0, 4).map((pos) => (
                  <span
                    key={pos}
                    className="text-xs px-2 py-0.5 rounded-full theme-transition"
                    style={{
                      backgroundColor: `${c.primary}10`,
                      color: c.textMuted,
                      fontSize: "10px",
                    }}
                  >
                    {pos}
                  </span>
                ))}
                {spread.positions.length > 4 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ color: c.textMuted, opacity: 0.5, fontSize: "10px" }}
                  >
                    +{spread.positions.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
