"use client";

import { forwardRef } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { StructuredFortune, FortuneAspect } from "@/lib/ai-fortune";

interface BaziContext {
  dayMaster: string;
  dayMasterElement: string;
  dayMasterYinYang: string;
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

// ── Pentagon radar chart ──

function FortuneRadar({
  aspects,
  colors,
  aspectLabels,
}: {
  aspects: FortuneAspect[];
  colors: Record<string, string>;
  aspectLabels: Record<string, string>;
}) {
  const sz = 280;
  const cx = sz / 2;
  const cy = sz / 2 + 5;
  const r = 90;
  const n = 5;

  const getPt = (i: number, radius: number) => {
    const a = -Math.PI / 2 + i * (2 * Math.PI) / n;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  };

  const values = aspects.map((a) =>
    a.rating === "strong" ? 1 : a.rating === "neutral" ? 0.6 : 0.3,
  );
  const grid = [0.25, 0.5, 0.75, 1.0];
  const ptsStr = (radius: number) =>
    Array.from({ length: n }, (_, i) => {
      const p = getPt(i, radius);
      return `${p.x},${p.y}`;
    }).join(" ");

  return (
    <div className="flex justify-center py-2">
      <svg viewBox={`0 0 ${sz} ${sz + 20}`} className="w-full max-w-[260px]">
        {/* Bagua-inspired rings */}
        <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke={`${colors.primary}10`} strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke={`${colors.primary}06`} strokeWidth="1" strokeDasharray="2 6" />

        {/* Grid pentagons */}
        {grid.map((l) => (
          <polygon key={l} points={ptsStr(r * l)} fill="none" stroke={`${colors.primary}12`} strokeWidth="1" />
        ))}

        {/* Axis lines */}
        {Array.from({ length: n }, (_, i) => {
          const p = getPt(i, r);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={`${colors.primary}10`} strokeWidth="1" />;
        })}

        {/* Data polygon */}
        <polygon
          points={aspects
            .map((a, i) => {
              const v = a.rating === "strong" ? 1 : a.rating === "neutral" ? 0.6 : 0.3;
              const p = getPt(i, r * v);
              return `${p.x},${p.y}`;
            })
            .join(" ")}
          fill={`${colors.primary}18`}
          stroke={colors.primary}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Vertex dots */}
        {Array.from({ length: n }, (_, i) => {
          const p = getPt(i, r * values[i]);
          const clr = ratingColor(aspects[i].rating);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="6" fill={clr} opacity="0.2" />
              <circle cx={p.x} cy={p.y} r="3.5" fill={clr} />
            </g>
          );
        })}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="3" fill={colors.primary} opacity="0.35" />

        {/* Labels */}
        {Array.from({ length: n }, (_, i) => {
          const p = getPt(i, r + 30);
          return (
            <g key={i}>
              <text
                x={p.x} y={p.y - 5}
                textAnchor="middle" dominantBaseline="middle" fontSize="15"
              >
                {ASPECT_EMOJI[aspects[i].name] || "✨"}
              </text>
              <text
                x={p.x} y={p.y + 12}
                textAnchor="middle" dominantBaseline="middle"
                fill={colors.text} fontSize="11" fontWeight="600"
              >
                {aspectLabels[aspects[i].name] || aspects[i].name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export default forwardRef<HTMLDivElement, DailyFortuneCardProps>(function DailyFortuneCard({
  fortuneData,
  userName,
  baziCtx,
  streak,
  pointsEarned,
  checkinDate,
}, ref) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const { t, tf } = useLocale();

  return (
    <div
      ref={ref}
      className="rounded-lg overflow-hidden animate-fade-in relative"
      style={{
        background: c.surface,
        border: `1px solid ${c.primary}22`,
        boxShadow: `0 4px 24px ${c.primary}10`,
      }}
    >
      {/* 福 stamp */}
      <div
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center select-none pointer-events-none"
        style={{
          background: "#C41E3A",
          borderRadius: 3,
          transform: "rotate(6deg)",
        }}
      >
        <span className="text-white text-[10px] font-bold leading-none" style={{ fontFamily: "serif" }}>
          福
        </span>
      </div>
      {/* Top decorative bar */}
      <div style={{
        height: 5,
        background: `repeating-linear-gradient(90deg,
          ${c.primary} 0, ${c.primary} 6px,
          transparent 6px, transparent 8px,
          ${c.primary}40 8px, ${c.primary}40 14px,
          transparent 14px, transparent 16px
        )`,
      }} />

      <div className="p-7 space-y-6">
        {/* Header: date */}
        <div className="text-center">
          <p className="text-xs font-medium tracking-wider" style={{ color: c.textMuted }}>
            ✦ {t.dailyFortune.chartTitle} — {formatDate(checkinDate)}
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
            {userName || t.dailyFortune.shareNameFallback}
            <span className="ml-2 font-normal" style={{ color: c.text, opacity: 0.7 }}>
              {t.dailyFortune.todayFortune}
            </span>
          </h2>

          {/* BaZi summary */}
          {baziCtx && (
            <p className="text-xs mt-1.5" style={{ color: c.textMuted }}>
              {ELEMENT_EMOJI[baziCtx.dayMasterElement] || "★"}{" "}
              {t.dailyFortune.yinYang[baziCtx.dayMasterYinYang] || baziCtx.dayMasterYinYang}{" "}
              {t.dailyFortune.elements[baziCtx.dayMasterElement] || baziCtx.dayMasterElement}
              <span className="mx-2">·</span>
              {t.dailyFortune.zodiacs[baziCtx.zodiac] || baziCtx.zodiac}
            </p>
          )}
        </div>

        {/* Life Aspects — pentagon chart */}
        <div>
          <p className="text-xs font-semibold tracking-wider text-center mb-3" style={{ color: c.textMuted }}>
            ✦ {t.dailyFortune.fortuneTitle}
          </p>
          <FortuneRadar aspects={fortuneData.aspects} colors={c} aspectLabels={t.dailyFortune.aspectNames as unknown as Record<string, string>} />
        </div>

        {/* Advice */}
        <div
          className="rounded-lg p-4"
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
              {t.dailyFortune.luckyColor}{" "}
              <span className="inline-block w-3 h-3 rounded-full align-middle mx-1" style={{ backgroundColor: fortuneData.luckyColor.toLowerCase() }} />
              <span style={{ color: c.primary }}>{t.dailyFortune.colorNames[fortuneData.luckyColor] || fortuneData.luckyColor}</span>
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
              {t.dailyFortune.luckyNumber} <span style={{ color: c.primary }}>{fortuneData.luckyNumber}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-7 py-4 flex items-center justify-between"
        style={{
          background: `${c.primary}06`,
          borderTop: `1px solid ${c.primary}10`,
        }}
      >
        <span className="text-[11px] font-medium tracking-wider" style={{ color: c.textMuted }}>
          {t.dailyFortune.brandFooter}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: c.textMuted }}>
            ✨ +{pointsEarned} {t.dailyFortune.pts}
          </span>
          {streak > 0 && (
            <span className="text-xs" style={{ color: c.textMuted }}>
              🔥 {tf("dailyFortune.dayStreak", { n: streak })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
