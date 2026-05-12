"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { StructuredFortune } from "@/lib/ai-fortune";
import {
  Sparkles, CheckCircle, Loader2, Flame, UserCircle,
} from "lucide-react";
import Link from "next/link";

// ── Types ──

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

interface CheckinToday {
  streak: number;
  pointsEarned: number;
  fortune: string;
  fortuneData?: StructuredFortune | null;
}

interface CheckinData {
  checkedIn: boolean;
  today: CheckinToday | null;
  baziContext?: BaziContext | null;
  totalPoints: number;
}

// ── Constants ──

const ELEMENT_COLORS: Record<string, string> = {
  Wood: "#4CAF50",
  Fire: "#FF5722",
  Earth: "#FFC107",
  Metal: "#9E9E9E",
  Water: "#2196F3",
};

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

function ratingArrow(rating: "strong" | "neutral" | "weak"): string {
  return rating === "strong" ? "↑" : rating === "neutral" ? "→" : "↓";
}

function ratingLabel(rating: "strong" | "neutral" | "weak"): string {
  return rating === "strong" ? "Strong" : rating === "neutral" ? "Neutral" : "Watch";
}

function ratingColor(rating: "strong" | "neutral" | "weak"): string {
  return rating === "strong" ? "#2ECC71" : rating === "neutral" ? "#F1C40F" : "#E74C3C";
}

// ── Rating Bar Component ──

function RatingBar({ rating }: { rating: "strong" | "neutral" | "weak" }) {
  const fill = rating === "strong" ? 5 : rating === "neutral" ? 3 : 1;
  const color = ratingColor(rating);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{ background: i <= fill ? color : "rgba(128,128,128,0.15)" }}
        />
      ))}
    </div>
  );
}

// ── Element Bar Component ──

function ElementBar({
  name,
  count,
  maxCount,
  isDayMaster,
}: {
  name: string;
  count: number;
  maxCount: number;
  isDayMaster: boolean;
}) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="w-5 text-center flex-shrink-0">{ELEMENT_EMOJI[name]}</span>
      <span
        className="text-[11px] font-medium w-10 flex-shrink-0"
        style={{ color: ELEMENT_COLORS[name] }}
      >
        {name}
      </span>
      <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(128,128,128,0.12)" }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: ELEMENT_COLORS[name],
          }}
        />
      </div>
      <span className="text-[11px] font-mono w-4 text-right" style={{ opacity: 0.5 }}>
        {count}
      </span>
      {isDayMaster && (
        <span className="text-[10px] font-semibold ml-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.1)" }}>
          DM
        </span>
      )}
    </div>
  );
}

// ── Main Component ──

export default function DailyCheckin({
  isSignedIn,
  initialData,
}: {
  isSignedIn: boolean;
  initialData?: CheckinData | null;
}) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;

  const [data, setData] = useState<CheckinData | null>(initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStatus = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/checkin", { signal });
      const json = await res.json();
      if (!json.error) setData(json);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    if (initialData) return;
    const controller = new AbortController();
    fetchStatus(controller.signal);
    return () => controller.abort();
  }, [isSignedIn, fetchStatus, initialData]);

  const handleCheckin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkin", { method: "POST" });
      const json = await res.json();
      if (json.error) {
        if (json.code === "PROFILE_REQUIRED") {
          setError(json.code);
        } else {
          setError(json.details ? `${json.error} (${json.details})` : json.error);
        }
      } else {
        setData({
          checkedIn: true,
          today: {
            streak: json.streak,
            pointsEarned: json.pointsEarned,
            fortune: json.fortune,
            fortuneData: json.fortuneData || undefined,
          },
          baziContext: json.baziContext,
          totalPoints: json.totalPoints,
        });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) return null;

  const fortuneData = data?.today?.fortuneData;
  const baziCtx = data?.baziContext;

  return (
    <div
      className="rounded-xl animate-fade-in overflow-hidden"
      style={{
        background: c.surface,
        border: `1px solid ${c.primary}22`,
      }}
    >
      {/* ── Header ── */}
      <div
        className="px-6 pt-5 pb-3"
        style={{
          background: `linear-gradient(135deg, ${c.primary}10 0%, transparent 60%)`,
          borderBottom: `1px solid ${c.primary}10`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: `${c.primary}18` }}
            >
              <Flame
                size={15}
                style={{
                  color: data?.checkedIn && data.today ? "#FF6B35" : c.primary,
                }}
              />
            </div>
            <h3 className="text-sm font-bold tracking-wider uppercase" style={{ color: c.text }}>
              Daily Fortune
            </h3>
          </div>
          {data?.today && (
            <div
              className="text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
              style={{
                background: "#FF6B3518",
                color: "#FF6B35",
                border: "1px solid #FF6B3522",
              }}
            >
              <Flame size={12} />
              {data.today.streak} day streak
            </div>
          )}
        </div>
      </div>

      {/* ── Not checked in ── */}
      {!data?.checkedIn && (
        <div className="px-6 py-8 text-center">
          {error === "PROFILE_REQUIRED" ? (
            <div className="animate-fade-in space-y-4">
              <div className="text-3xl mb-2">🔮</div>
              <p className="text-sm" style={{ color: c.textMuted }}>
                Complete your birth profile to receive personalized daily fortunes based on your BaZi chart.
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  backgroundColor: c.primary,
                  color: isDark ? c.bg : "#FFFFFF",
                  boxShadow: `0 0 15px ${currentTheme.glow}`,
                }}
              >
                <UserCircle size={16} />
                Set Up Profile
              </Link>
            </div>
          ) : (
            <div className="animate-fade-in space-y-4">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-sm" style={{ color: c.textMuted }}>
                Check in to receive your AI-powered BaZi fortune of the day
              </p>
              <button
                onClick={handleCheckin}
                disabled={loading}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  backgroundColor: loading ? `${c.primary}30` : c.primary,
                  color: loading ? c.textMuted : isDark ? c.bg : "#FFFFFF",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : `0 0 20px ${currentTheme.glow}`,
                }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {loading ? "Consulting the stars..." : "Check In ✨"}
              </button>
              {error && error !== "PROFILE_REQUIRED" && (
                <p className="text-xs mt-2" style={{ color: "#E74C3C" }}>
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Checked in — show fortune ── */}
      {data?.checkedIn && data.today && (
        <div className="px-6 py-5 space-y-5 animate-fade-in">
          {fortuneData ? (
            <>
              {/* ── BaZi Summary Card ── */}
              {baziCtx && (
                <div
                  className="rounded-xl p-4 animate-fade-in"
                  style={{
                    background: `linear-gradient(135deg, ${c.primary}08 0%, ${c.primary}03 100%)`,
                    border: `1px solid ${c.primary}12`,
                  }}
                >
                  {/* Day Master + Today Pillar */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: c.textMuted }}>
                        Your Chart
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-lg" style={{ color: ELEMENT_COLORS[baziCtx.dayMasterElement] || c.primary }}>
                          {ELEMENT_EMOJI[baziCtx.dayMasterElement] || "★"}
                        </span>
                        <span className="text-sm font-bold" style={{ color: c.text }}>
                          {baziCtx.dayMaster}
                        </span>
                        <span className="text-xs" style={{ color: c.textMuted }}>
                          {baziCtx.zodiac}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: c.textMuted }}>
                        Today&apos;s Energy
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                        <span
                          className="text-sm font-bold"
                          style={{ color: ELEMENT_COLORS[baziCtx.todayElement] || c.primary }}
                        >
                          {baziCtx.todayStem}{baziCtx.todayBranch}
                        </span>
                        <span
                          className="text-[11px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            background: `${ELEMENT_COLORS[baziCtx.todayElement] || c.primary}15`,
                            color: ELEMENT_COLORS[baziCtx.todayElement] || c.primary,
                          }}
                        >
                          {baziCtx.todayElement}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Element bars */}
                  <div className="space-y-0.5">
                    {(["Wood", "Fire", "Earth", "Metal", "Water"] as const).map((el) => (
                      <ElementBar
                        key={el}
                        name={el}
                        count={baziCtx.elementCounts[el] || 0}
                        maxCount={Math.max(1, ...Object.values(baziCtx.elementCounts))}
                        isDayMaster={el === baziCtx.dayMasterElement}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Life Aspects ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs">📊</span>
                  <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.textMuted }}>
                    Life Aspects
                  </h4>
                </div>
                <div className="grid gap-2">
                  {fortuneData.aspects.map((aspect, i) => (
                    <div
                      key={aspect.name}
                      className="rounded-xl px-4 py-3 animate-fade-in"
                      style={{
                        background: `${c.primary}06`,
                        border: `1px solid ${c.primary}08`,
                        animationDelay: `${i * 0.08}s`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg flex-shrink-0">
                          {ASPECT_EMOJI[aspect.name] || "✨"}
                        </span>
                        <span className="text-xs font-semibold w-24 flex-shrink-0" style={{ color: c.text }}>
                          {aspect.name}
                        </span>
                        <RatingBar rating={aspect.rating} />
                        <span
                          className="text-[11px] font-bold flex items-center gap-0.5"
                          style={{ color: ratingColor(aspect.rating) }}
                        >
                          {ratingArrow(aspect.rating)} {ratingLabel(aspect.rating)}
                        </span>
                      </div>
                      <p className="text-xs mt-1.5 ml-9 leading-relaxed" style={{ color: c.textMuted }}>
                        {aspect.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Advice ── */}
              <div
                className="rounded-xl p-4 animate-fade-in"
                style={{
                  background: `linear-gradient(135deg, ${c.primary}10 0%, ${c.primary}05 100%)`,
                  border: `1px solid ${c.primary}15`,
                  borderLeft: `3px solid ${c.primary}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-base mt-0.5">💡</span>
                  <div>
                    <span className="text-xs font-bold" style={{ color: c.primary }}>
                      Today&apos;s Advice
                    </span>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: c.text }}>
                      {fortuneData.advice}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Lucky Section ── */}
              <div className="flex items-center gap-4 animate-fade-in">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                  style={{
                    background: `${c.primary}10`,
                    border: `1px solid ${c.primary}15`,
                  }}
                >
                  <span>🍀</span>
                  <span className="font-medium" style={{ color: c.text }}>
                    Lucky Color: <span style={{ color: c.primary }}>{fortuneData.luckyColor}</span>
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
            </>
          ) : (
            /* ── Plain text fallback ── */
            <div className="flex items-start gap-3 py-2">
              <CheckCircle size={18} style={{ color: "#2ECC71", marginTop: 2 }} />
              <div>
                <p className="text-sm leading-relaxed italic" style={{ color: c.text }}>
                  &ldquo;{data.today.fortune}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* ── Footer stats ── */}
          <div
            className="flex items-center gap-5 pt-3"
            style={{ borderTop: `1px solid ${c.primary}10` }}
          >
            <span className="text-xs flex items-center gap-1" style={{ color: c.textMuted }}>
              <Sparkles size={12} />+{data.today.pointsEarned} pts
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: c.textMuted }}>
              <Flame size={12} /> {data.today.streak} day streak
            </span>
            {fortuneData && (
              <span className="text-xs flex items-center gap-1" style={{ color: c.textMuted }}>
                🤖 AI-powered
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Points total ── */}
      {data && (
        <div
          className="px-6 py-3 flex justify-between items-center"
          style={{
            background: `${c.primary}06`,
            borderTop: `1px solid ${c.primary}10`,
          }}
        >
          <span className="text-xs" style={{ color: c.textMuted }}>
            Points balance
          </span>
          <span className="text-sm font-bold" style={{ color: c.primary }}>
            {data.totalPoints} pts
          </span>
        </div>
      )}
    </div>
  );
}
