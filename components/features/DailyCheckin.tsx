"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { StructuredFortune } from "@/lib/ai-fortune";
import {
  Sparkles, CheckCircle, Loader2, Flame,
} from "lucide-react";
import DailyFortuneCard from "@/components/features/DailyFortuneCard";
import FortuneShare from "@/components/features/FortuneShare";
import BaziChart from "@/components/features/BaziChart";

// ── Types ──

interface PillarInfo {
  stem: string;
  stemIndex: number;
  branch: string;
  branchIndex: number;
  stemElement: string;
  branchElement: string;
  zodiac: string;
}

interface HiddenStemInfo {
  stem: string;
  stemIndex: number;
  qi: string;
  element: string;
}

interface BaziContext {
  dayMaster: string;
  dayMasterElement: string;
  dayMasterYinYang: string;
  dayMasterIndex: number;
  zodiac: string;
  elementCounts: Record<string, number>;
  todayStem: string;
  todayBranch: string;
  todayStemEn: string;
  todayBranchEn: string;
  todayElement: string;
  pillars?: {
    year: PillarInfo;
    month: PillarInfo;
    day: PillarInfo;
    hour: PillarInfo;
  };
  tenGods?: string[];
  naYin?: string[];
  hiddenStems?: HiddenStemInfo[][];
}

interface CheckinToday {
  streak: number;
  pointsEarned: number;
  subscriberBonus?: number;
  fortune: string;
  fortuneData?: StructuredFortune | null;
}

interface HistoryItem {
  checkin_date: string;
  streak: number;
  points_earned: number;
  fortune: string;
  fortuneData?: StructuredFortune | null;
}

interface CheckinData {
  checkedIn: boolean;
  today: CheckinToday | null;
  baziContext?: BaziContext | null;
  totalPoints: number;
  recentHistory?: HistoryItem[];
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
  const { t, tf, locale } = useLocale();

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
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.details ? `${json.error} (${json.details})` : t.common.error);
      } else {
        setData({
          checkedIn: true,
          today: {
            streak: json.streak,
            pointsEarned: json.pointsEarned,
            subscriberBonus: json.subscriberBonus,
            fortune: json.fortune,
            fortuneData: json.fortuneData,
          },
          baziContext: json.baziContext ?? null,
          totalPoints: json.totalPoints,
          recentHistory: data?.recentHistory ?? [],
        });
      }
    } catch {
      setError(t.common.networkError);
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) return null;

  const fortuneData = data?.today?.fortuneData;
  const baziCtx = data?.baziContext;
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="rounded-lg animate-fade-in overflow-hidden"
      style={{
        background: c.surface,
        border: `1px solid ${c.primary}22`,
      }}
    >
      {/* ── Header ── */}
      <div
        className="px-7 pt-6 pb-4"
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
              {t.dailyFortune.title}
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
              {tf("dailyFortune.dayStreak", { n: data.today.streak })}
            </div>
          )}
        </div>
      </div>

      {/* ── Not checked in ── */}
      {!data?.checkedIn && (
        <div className="px-7 py-10 text-center">
          <div className="animate-fade-in space-y-4">
            <div className="text-3xl mb-2">✨</div>
            <p className="text-sm" style={{ color: c.textMuted }}>
              {t.dailyFortune.checkInPrompt}
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
              {loading ? t.dailyFortune.checkingIn : `${t.dailyFortune.checkIn} ✨`}
            </button>
            {error && (
              <p className="text-xs mt-2" style={{ color: "#E74C3C" }}>
                {error}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Checked in — show Bazi chart + fortune card ── */}
      {data?.checkedIn && data.today && (
        <div className="px-7 py-6 space-y-5 animate-fade-in">
          {/* BaZi Four Pillars Chart */}
          {baziCtx?.pillars && (
            <BaziChart
              pillars={baziCtx.pillars}
              naYin={baziCtx.naYin || []}
              hiddenStems={baziCtx.hiddenStems || []}
              dayMasterIndex={baziCtx.dayMasterIndex}
              dayMasterElement={baziCtx.dayMasterElement}
              dayMasterYinYang={baziCtx.dayMasterYinYang}
              elementCounts={baziCtx.elementCounts}
              zodiac={baziCtx.zodiac}
            />
          )}

          {fortuneData ? (
            <>
              <DailyFortuneCard
                ref={cardRef}
                fortuneData={fortuneData}
                userName={user?.name || user?.email || ""}
                baziCtx={baziCtx}
                streak={data.today.streak}
                pointsEarned={data.today.pointsEarned}
                checkinDate={new Date().toISOString()}
              />
              <FortuneShare
                text={(() => {
                  const name = user?.name || t.dailyFortune.shareNameFallback;
                  const fortune = `${name} ${t.dailyFortune.todayFortune}\n${fortuneData.advice || ""}\n🍀 ${t.dailyFortune.shareLuckyLabel} ${fortuneData.luckyColor || ""} | 🔢 ${t.dailyFortune.shareLuckyNumLabel} ${fortuneData.luckyNumber ?? ""}`;
                  return tf("dailyFortune.shareTemplate", { fortune });
                })()}
                cardRef={cardRef}
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
            className="flex items-center gap-5 pt-3 flex-wrap"
            style={{ borderTop: `1px solid ${c.primary}10` }}
          >
            <span className="text-xs flex items-center gap-1" style={{ color: c.textMuted }}>
              <Sparkles size={12} />+{data.today.pointsEarned} {t.dailyFortune.pts}
            </span>
            {data.today.subscriberBonus ? (
              <span className="text-xs flex items-center gap-1 font-semibold" style={{ color: c.primary }}>
                🎖️ +{data.today.subscriberBonus} {t.dailyFortune.subscriberBonus}
              </span>
            ) : null}
            <span className="text-xs flex items-center gap-1" style={{ color: c.textMuted }}>
              <Flame size={12} /> {tf("dailyFortune.dayStreak", { n: data.today.streak })}
            </span>
            {fortuneData && (
              <span className="text-xs flex items-center gap-1" style={{ color: c.textMuted }}>
                🤖 {t.dailyFortune.aiPowered}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Check-in history ── */}
      {data?.checkedIn && data.recentHistory && data.recentHistory.length > 0 && (
        <div
          className="px-7 py-5 space-y-2 animate-fade-in"
          style={{ borderTop: `1px solid ${c.primary}10` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
            <h4 className="text-[11px] font-bold tracking-wider uppercase" style={{ color: c.textMuted }}>
              {t.dailyFortune.checkInHistory}
            </h4>
          </div>
          <div className="space-y-1.5">
            {data.recentHistory.map((h) => {
              const dateStr = new Date(h.checkin_date).toLocaleDateString(locale, {
                month: "short",
                day: "numeric",
              });
              const hasFortuneData = !!h.fortuneData;
              return (
                <div
                  key={h.checkin_date}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                  style={{ background: `${c.primary}06` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium" style={{ color: c.textMuted, minWidth: 56 }}>
                      {dateStr}
                    </span>
                    <span className="flex items-center gap-1" style={{ color: c.text }}>
                      <Flame size={11} style={{ color: "#FF6B35" }} />
                      {tf("dailyFortune.dayStreak", { n: h.streak })}
                    </span>
                    {hasFortuneData && (
                      <span style={{ color: "#2ECC71" }}>✦</span>
                    )}
                  </div>
                  <span className="font-semibold" style={{ color: c.primary }}>
                    +{h.points_earned} {t.dailyFortune.pts}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Points total ── */}
      {data && (
        <div
          className="px-7 py-4 flex justify-between items-center"
          style={{
            background: `${c.primary}06`,
            borderTop: `1px solid ${c.primary}10`,
          }}
        >
          <span className="text-xs" style={{ color: c.textMuted }}>
            {t.dailyFortune.pointsBalance}
          </span>
          <span className="text-sm font-bold" style={{ color: c.primary }}>
            {data.totalPoints} {t.dailyFortune.pts}
          </span>
        </div>
      )}
    </div>
  );
}
