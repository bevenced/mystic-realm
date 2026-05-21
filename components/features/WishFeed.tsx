"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { Sparkles } from "lucide-react";

interface FeedWish {
  id: string;
  category: string;
  text: string;
  userName: string;
  timeLabel: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  health: "💚",
  wealth: "💰",
  luck: "🍀",
  friendship: "🤝",
  love: "❤️",
};

function truncate(text: string, max = 70): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export default function WishFeed() {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;
  const [wishes, setWishes] = useState<FeedWish[]>([]);

  useEffect(() => {
    fetch("/api/wish/feed")
      .then((r) => r.json())
      .then((json) => {
        if (!json.error && json.wishes) setWishes(json.wishes);
      })
      .catch(() => {});
  }, []);

  if (wishes.length === 0) return null;

  // Duplicate for seamless scroll
  const items = [...wishes, ...wishes];

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: c.surface,
        border: `1px solid ${c.primary}22`,
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{
          borderBottom: `1px solid ${c.primary}10`,
          background: `${c.primary}06`,
        }}
      >
        <Sparkles size={14} style={{ color: c.primary }} />
        <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: c.text }}>
          {t.wish.recentWishes}
        </h3>
        <span className="text-[10px] ml-auto" style={{ color: c.textMuted }}>
          {wishes.length}
        </span>
      </div>

      {/* Scrolling feed */}
      <div className="relative overflow-hidden" style={{ height: 520 }}>
        <style>{`
          @keyframes wish-scroll {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          .wish-scroll {
            animation: wish-scroll 50s linear infinite;
          }
          .wish-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="wish-scroll" style={{ willChange: "transform" }}>
          {items.map((wish, i) => (
            <div
              key={`${wish.id}-${i}`}
              className="px-5 py-3 transition-colors"
              style={{
                borderBottom: `1px solid ${c.primary}06`,
                background: i % 2 === 0 ? "transparent" : `${c.primary}04`,
              }}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0 mt-0.5">
                  {CATEGORY_EMOJI[wish.category] || "✨"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-semibold" style={{ color: c.primary }}>
                      {wish.userName}
                    </span>
                    <span className="text-[10px]" style={{ color: c.textMuted }}>
                      {wish.timeLabel}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: c.text, opacity: 0.85 }}>
                    &ldquo;{truncate(wish.text)}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fade edges */}
        <div
          className="absolute top-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, ${c.surface}, transparent)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${c.surface}, transparent)`,
          }}
        />
      </div>
    </div>
  );
}
