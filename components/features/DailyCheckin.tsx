"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import type { StructuredFortune } from "@/lib/ai-fortune";
import {
  Sparkles, CheckCircle, Loader2, Flame, UserCircle,
} from "lucide-react";
import Link from "next/link";
import DailyFortuneCard from "@/components/features/DailyFortuneCard";
import FortuneShare from "@/components/features/FortuneShare";

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
  const { user } = useAuth();

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

      {/* ── Checked in — show fortune card ── */}
      {data?.checkedIn && data.today && (
        <div className="px-6 py-5 space-y-4 animate-fade-in">
          {fortuneData ? (
            <>
              <DailyFortuneCard
                fortuneData={fortuneData}
                userName={user?.name || user?.email || ""}
                baziCtx={baziCtx}
                streak={data.today.streak}
                pointsEarned={data.today.pointsEarned}
                checkinDate={new Date().toISOString()}
              />
              <FortuneShare
                text={`✨ ${user?.name || "Your"} Daily Fortune\n${fortuneData.advice}\n🍀 Lucky: ${fortuneData.luckyColor} | 🔢 Lucky #: ${fortuneData.luckyNumber}\n—— Orient Wisdom`}
              />
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
              <Sparkles size={12} />+{data.today.pointsEarned} 积分
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
            {data.totalPoints} 积分
          </span>
        </div>
      )}
    </div>
  );
}
