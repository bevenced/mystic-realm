"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import type { StructuredFortune } from "@/lib/ai-fortune";

interface BaziContext {
  dayMaster: string;
  dayMasterElement: string;
  zodiac: string;
  elementCounts: Record<string, number>;
  todayStem: string;
  todayBranch: string;
  todayStemEn: string;
  todayBranchEn: string;
  todayElement: string;
}

interface DailyFortuneCardProps {
  fortuneData: StructuredFortune;
  userName: string;
  baziCtx?: BaziContext | null;
  streak: number;
  pointsEarned: number;
  checkinDate: string;
}

const ELEMENT_EMOJI: Record<string, string> = {
  Wood: "🌳",
  Fire: "🔥",
  Earth: "🌍",
  Metal: "⚔️",
  Water: "💧",
};

const ASPECT_EMOJI: Record<string, string> = {
  Wealth: "💰",
  Career: "💼",
  Relationships: "❤️",
  Health: "💪",
  Social: "🤝",
};

function ratingColor(rating: "strong" | "neutral" | "weak"): string {
  return rating === "strong" ? "#2ECC71" : rating === "neutral" ? "#F1C40F" : "#E74C3C";
}

function ratingDots(rating: "strong" | "neutral" | "weak"): number {
  return rating === "strong" ? 5 : rating === "neutral" ? 3 : 1;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function DailyFortuneCard({
  fortuneData,
  userName,
  baziCtx,
  streak,
  pointsEarned,
  checkinDate,
}: DailyFortuneCardProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;

  return (
    <div
      className="rounded-xl overflow-hidden animate-fade-in"
      style={{
        background: c.surface,
        border: `1px solid ${c.primary}22`,
        boxShadow: `0 4px 24px ${c.primary}10`,
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${c.primary}, ${c.primary}60)` }} />

      <div className="p-6 space-y-5">
        {/* Header: date */}
        <div className="text-center">
          <p className="text-xs font-medium tracking-wider" style={{ color: c.textMuted }}>
            ✦ Today&apos;s Fortune — {formatDate(checkinDate)}
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: `${c.primary}20` }} />
          <div className="w-2 h-2 rotate-45" style={{ background: c.primary }} />
          <div className="flex-1 h-px" style={{ background: `${c.primary}20` }} />
        </div>

        {/* Name */}
        <div className="text-center">
          <h2
            className="text-2xl md:text-3xl font-bold tracking-wide"
            style={{ color: c.primary }}
          >
            {userName || "Your"}
            <span className="ml-2 font-normal" style={{ color: c.text, opacity: 0.7 }}>
              Daily Fortune
            </span>
          </h2>

          {/* BaZi summary */}
          {baziCtx && (
            <p className="text-xs mt-1.5" style={{ color: c.textMuted }}>
              {ELEMENT_EMOJI[baziCtx.dayMasterElement] || "★"} {baziCtx.dayMaster}
              <span className="mx-2">·</span>
              {baziCtx.zodiac}
            </p>
          )}
        </div>

        {/* Life Aspects */}
        <div className="space-y-2">
          {fortuneData.aspects.map((aspect) => (
            <div
              key={aspect.name}
              className="flex items-center gap-3 px-3 py-2 rounded-lg"
              style={{ background: `${c.primary}06` }}
            >
              <span className="text-base flex-shrink-0">{ASPECT_EMOJI[aspect.name] || "✨"}</span>
              <span className="text-xs font-semibold w-20 flex-shrink-0" style={{ color: c.text }}>
                {aspect.name}
              </span>
              {/* Dots */}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: i <= ratingDots(aspect.rating) ? ratingColor(aspect.rating) : `${c.primary}10`,
                    }}
                  />
                ))}
              </div>
              <span
                className="text-[11px] font-bold flex-shrink-0"
                style={{ color: ratingColor(aspect.rating) }}
              >
                {aspect.rating === "strong" ? "↑" : aspect.rating === "neutral" ? "→" : "↓"}{" "}
                {aspect.rating === "strong" ? "Strong" : aspect.rating === "neutral" ? "Neutral" : "Watch"}
              </span>
            </div>
          ))}
        </div>

        {/* Advice */}
        <div
          className="rounded-xl p-4"
          style={{
            background: `linear-gradient(135deg, ${c.primary}10 0%, ${c.primary}05 100%)`,
            border: `1px solid ${c.primary}15`,
            borderLeft: `3px solid ${c.primary}`,
          }}
        >
          <p className="text-xs leading-relaxed italic" style={{ color: c.text }}>
            &ldquo;{fortuneData.advice}&rdquo;
          </p>
        </div>

        {/* Lucky section */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{
              background: `${c.primary}10`,
              border: `1px solid ${c.primary}15`,
            }}
          >
            <span>🍀</span>
            <span className="font-medium" style={{ color: c.text }}>
              Lucky Color:{" "}
              <span className="inline-block w-3 h-3 rounded-full align-middle mx-1" style={{ backgroundColor: fortuneData.luckyColor.toLowerCase() }} />
              <span style={{ color: c.primary }}>{fortuneData.luckyColor}</span>
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{
              background: `${c.primary}10`,
              border: `1px solid ${c.primary}15`,
            }}
          >
            <span>🔢</span>
            <span className="font-medium" style={{ color: c.text }}>
              Lucky #: <span style={{ color: c.primary }}>{fortuneData.luckyNumber}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-6 py-3 flex items-center justify-between"
        style={{
          background: `${c.primary}06`,
          borderTop: `1px solid ${c.primary}10`,
        }}
      >
        <span className="text-[11px] font-medium tracking-wider" style={{ color: c.textMuted }}>
          Orient Wisdom ✦
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: c.textMuted }}>
            ✨ +{pointsEarned} pts
          </span>
          {streak > 0 && (
            <span className="text-xs" style={{ color: c.textMuted }}>
              🔥 {streak}d streak
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
