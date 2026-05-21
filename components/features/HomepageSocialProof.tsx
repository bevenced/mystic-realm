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

function truncate(text: string, max = 60): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export default function HomepageSocialProof() {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;
  const [wishes, setWishes] = useState<FeedWish[]>([]);

  useEffect(() => {
    fetch("/api/wish/feed")
      .then((r) => r.json())
      .then((json) => {
        if (!json.error && json.wishes) setWishes(json.wishes.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  if (wishes.length === 0) return null;

  return (
    <section className="py-16 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <p
            className="text-sm tracking-widest uppercase mb-3"
            style={{ color: "var(--color-text-muted)" }}
          >
            {t.ui.community}
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            {t.ui.blessings}
          </h2>
          <p className="text-sm mt-3" style={{ color: "var(--color-text-muted)" }}>
            {t.ui.blessingDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishes.map((wish, index) => (
            <div
              key={wish.id}
              className="group relative rounded-lg overflow-hidden animate-slide-up"
              style={{
                opacity: 0,
                animationDelay: `${index * 80}ms`,
                animationFillMode: "forwards",
                background: currentTheme.isDark
                  ? `linear-gradient(135deg, ${c.surface} 0%, ${c.primary}10 100%)`
                  : `linear-gradient(135deg, ${c.surface} 0%, ${c.primary}06 100%)`,
                border: `1px solid ${c.primary}22`,
              }}
            >
              <div className="relative p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{CATEGORY_EMOJI[wish.category] || "✨"}</span>
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: c.primary }}
                  >
                    {wish.userName}
                  </span>
                  <span className="text-[10px] ml-auto" style={{ color: c.textMuted }}>
                    {wish.timeLabel}
                  </span>
                </div>
                <p
                  className="text-sm leading-relaxed italic"
                  style={{ color: c.text, opacity: 0.85 }}
                >
                  &ldquo;{truncate(wish.text)}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
