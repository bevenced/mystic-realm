"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import BaziChart from "@/components/features/BaziChart";
import { getAllTenGods, getNaYin, getHiddenStems } from "@/lib/bazi";
import type { BaZiResult, BaZiPillar } from "@/lib/bazi";
import Link from "next/link";
import {
  Sparkles, Loader2, Lock, Calendar, Clock, Users,
} from "lucide-react";
import PayPalButton from "@/components/features/PayPalButton";

interface ApiResponse {
  baziData: BaZiResult;
  reading: {
    preview?: string;
    overview?: string;
    dayMaster?: string;
    elementAnalysis?: { dominant?: string; lacking?: string; balance?: string } | string;
    lifeAspects?: Record<string, string>;
    advice?: string;
    pillars?: Array<{ name: string; stem: string; branch: string; hiddenStems: string; tenGod: string; meaning: string }>;
    affirmation?: string;
    luckyElements?: string[];
    [key: string]: unknown;
  };
  professionalData?: any;
  birthDate?: string;
  birthHour?: number;
  gender?: string;
  tokensUsed?: number;
  error?: string;
  details?: any;
}

const HOUR_OPTIONS = [
  { v: 0, label: "子时 23:00-01:00", en: "Zi 23:00-01:00" },
  { v: 1, label: "丑时 01:00-03:00", en: "Chou 01:00-03:00" },
  { v: 2, label: "寅时 03:00-05:00", en: "Yin 03:00-05:00" },
  { v: 3, label: "卯时 05:00-07:00", en: "Mao 05:00-07:00" },
  { v: 4, label: "辰时 07:00-09:00", en: "Chen 07:00-09:00" },
  { v: 5, label: "巳时 09:00-11:00", en: "Si 09:00-11:00" },
  { v: 6, label: "午时 11:00-13:00", en: "Wu 11:00-13:00" },
  { v: 7, label: "未时 13:00-15:00", en: "Wei 13:00-15:00" },
  { v: 8, label: "申时 15:00-17:00", en: "Shen 15:00-17:00" },
  { v: 9, label: "酉时 17:00-19:00", en: "You 17:00-19:00" },
  { v: 10, label: "戌时 19:00-21:00", en: "Xu 19:00-21:00" },
  { v: 11, label: "亥时 21:00-23:00", en: "Hai 21:00-23:00" },
];

export default function BaziClient() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const { isSignedIn } = useAuth();
  const { locale, t } = useLocale();

  // Restore form state from URL params (after sign-in redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bd = params.get("birthDate");
    const bh = params.get("birthHour");
    const g = params.get("gender");
    if (bd) setBirthDate(bd);
    if (bh) setBirthHour(Number(bh));
    if (g === "male" || g === "female") setGender(g);
    // If we came back from sign-in with form data, auto-submit
    if (bd && bh) {
      // Clean URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete("birthDate");
      url.searchParams.delete("birthHour");
      url.searchParams.delete("gender");
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  // Form state
  const [birthDate, setBirthDate] = useState("");
  const [birthHour, setBirthHour] = useState<number>(8);
  const [gender, setGender] = useState<"male" | "female">("male");

  // Result state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);

  // Report payment flow
  const [selectedReport, setSelectedReport] = useState<"annual" | "personality" | "deep" | null>(null);
  const [reportResult, setReportResult] = useState<{ type: string; reading: ApiResponse["reading"] } | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const reportLabels: Record<string, { title: string; desc: string; price: number; serviceKey: string }> = {
    annual: {
      title: t.bazi.annual.title,
      desc: t.bazi.annual.desc,
      price: 3.99,
      serviceKey: "bazi-annual",
    },
    personality: {
      title: t.bazi.personality.title,
      desc: t.bazi.personality.desc,
      price: 3.99,
      serviceKey: "bazi-personality",
    },
    deep: {
      title: t.bazi.deep.title,
      desc: t.bazi.deep.desc,
      price: 5.99,
      serviceKey: "bazi-deep",
    },
  };

  // Build chart data from API response
  const baziData = result?.baziData;
  const chartData = (() => {
    if (!baziData) return null;
    const pillarKeys: ("year" | "month" | "day" | "hour")[] = ["year", "month", "day", "hour"];
    const tenGods = getAllTenGods(baziData.dayMasterIndex, [
      baziData.year.stemIndex,
      baziData.month.stemIndex,
      baziData.day.stemIndex,
      baziData.hour.stemIndex,
    ]).map((t) => t.tenGodName);
    const naYin = pillarKeys.map((k) => getNaYin(baziData[k].stemIndex, baziData[k].branchIndex).toneName);
    const hiddenStems = pillarKeys.map((k) => getHiddenStems(baziData[k].branchIndex));
    return { tenGods, naYin, hiddenStems };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai-bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, birthHour, gender, locale }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.details ? `${json.error} (${JSON.stringify(json.details)})` : json.error);
      } else {
        setResult(json);
      }
    } catch {
      setError(t.bazi.networkError);
    } finally {
      setLoading(false);
    }
  };

  const [redeemingPoints, setRedeemingPoints] = useState(false);

  // Build sign-in URL that preserves form state
  const signInWithReturnUrl = () => {
    const returnParams = new URLSearchParams({ birthDate, birthHour: String(birthHour), gender });
    return `/sign-in?redirect_url=${encodeURIComponent(`/bazi?${returnParams.toString()}`)}`;
  };

  // Rotating loading messages
  const loadingMessages = [
    t.bazi.submitting,
    "🔮",
    "✨",
  ];
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [loading]);

  // Handle report tab click
  const handleReportClick = (type: "annual" | "personality" | "deep") => {
    if (!isSignedIn) {
      window.location.href = signInWithReturnUrl();
      return;
    }
    setSelectedReport(type);
    setShowPayment(true);
    setReportResult(null);
  };

  // Fetch report with orderId (PayPal)
  const fetchReport = async (orderId: string) => {
    if (!selectedReport || !birthDate) return;
    setShowPayment(false);
    setReportLoading(true);
    await loadReport({ orderId });
  };

  // Fetch report with points
  const fetchReportWithPoints = async () => {
    if (!selectedReport || !birthDate) return;
    setRedeemingPoints(true);
    try {
      const redeemRes = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: reportLabels[selectedReport].serviceKey }),
      });
      const redeemData = await redeemRes.json();
      if (redeemData.error) {
        setError(redeemData.error);
        setRedeemingPoints(false);
        return;
      }
      setShowPayment(false);
      setReportLoading(true);
      setRedeemingPoints(false);
      await loadReport({ redeemed: redeemData.token });
    } catch {
      setError(t.bazi.redeemFailed);
      setRedeemingPoints(false);
    }
  };

  // Common report loader
  const loadReport = async (extra: { orderId?: string; redeemed?: string }) => {
    setReportLoading(true);
    try {
      const res = await fetch("/api/ai-bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
          birthHour,
          gender,
          reportType: selectedReport,
          locale,
          ...extra,
        }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setReportResult({ type: selectedReport!, reading: json.reading });
      }
    } catch {
      setError(t.bazi.networkError);
    } finally {
      setReportLoading(false);
    }
  };

  // Format date helper
  const formatDate = (d: string) => {
    if (!d) return "";
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <main className="min-h-screen">
      {/* Hero gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          height: "400px",
          background: `radial-gradient(ellipse at 50% 0%, ${c.primary}10 0%, transparent 70%)`,
        }}
      />

      <div className="relative mx-auto max-w-2xl px-6 pt-20 pb-20">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase mb-4"
            style={{ background: `${c.primary}14`, color: c.primary }}>
            <Sparkles size={12} />
            {t.bazi.badge}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif" style={{ color: c.text }}>
            {t.bazi.title}
          </h1>
          <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: c.textMuted }}>
            {t.bazi.subtitle}
          </p>
        </div>

        {/* Form */}
        <div
          className="relative rounded-xl p-6 mb-8 animate-fade-in"
          style={{ background: c.surface, border: `1px solid ${c.primary}18` }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Birth Date */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: c.textMuted }}>
                <Calendar size={13} />
                {t.bazi.birthDate}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none transition-colors"
                style={{
                  background: `${c.primary}06`,
                  color: c.text,
                  borderColor: `${c.primary}22`,
                }}
              />
            </div>

            {/* Birth Hour */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: c.textMuted }}>
                <Clock size={13} />
                {t.bazi.birthHour}
              </label>
              <select
                value={birthHour}
                onChange={(e) => setBirthHour(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg text-sm border outline-none transition-colors"
                style={{
                  background: `${c.primary}06`,
                  color: c.text,
                  borderColor: `${c.primary}22`,
                }}
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h.v} value={h.v}>{locale.startsWith("zh") ? h.label : h.en}</option>
                ))}
              </select>
              <p className="text-[10px] mt-1" style={{ color: c.textMuted }}>
                {t.bazi.birthHourHint}
              </p>
            </div>

            {/* Gender */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: c.textMuted }}>
                <Users size={13} />
                {t.bazi.gender}
              </label>
              <div className="flex gap-3">
                {(["male", "female"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: gender === g ? `${c.primary}18` : `${c.primary}06`,
                      color: gender === g ? c.primary : c.textMuted,
                      border: `1px solid ${gender === g ? c.primary : `${c.primary}14`}`,
                    }}
                  >
                    {g === "male" ? t.bazi.male : t.bazi.female}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !birthDate}
              className="w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: loading || !birthDate ? `${c.primary}30` : c.primary,
                color: loading ? c.textMuted : c.bg,
                cursor: loading || !birthDate ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : `0 0 20px ${currentTheme.glow}`,
              }}
            >
              <Sparkles size={16} />
              {t.bazi.submit}
            </button>

            {/* Loading overlay */}
            {loading && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl z-10"
                style={{ background: `${c.surface}F2` }}
              >
                <div className="relative w-14 h-14">
                  <div
                    className="absolute inset-0 rounded-full animate-spin"
                    style={{
                      border: `2px solid transparent`,
                      borderTopColor: c.primary,
                      borderRightColor: `${c.primary}60`,
                    }}
                  />
                  <div
                    className="absolute inset-2 rounded-full"
                    style={{
                      border: `2px solid transparent`,
                      borderBottomColor: `${c.primary}40`,
                      borderLeftColor: `${c.primary}20`,
                      animation: "spin 2s linear infinite reverse",
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-lg">☯️</span>
                </div>
                <p className="text-xs font-semibold animate-pulse" style={{ color: c.primary }}>
                  {loadingMessages[loadingMsgIdx]}
                </p>
              </div>
            )}
          </form>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: "#E74C3C14", color: "#E74C3C", border: "1px solid #E74C3C22" }}>
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {baziData && (
          <div className="space-y-6 animate-fade-in">
            {/* User info bar */}
            <div
              className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-lg text-xs"
              style={{ background: `${c.primary}06`, border: `1px solid ${c.primary}12` }}
            >
              <span style={{ color: c.textMuted }}>
                {formatDate(birthDate)}
              </span>
              <span style={{ color: c.primary }}>
                {(HOUR_OPTIONS.find((h) => h.v === birthHour)?.[locale.startsWith("zh") ? "label" : "en"] || "").split(" ")[0]}
              </span>
              <span style={{ color: c.textMuted }}>
                {gender === "male" ? t.bazi.male : t.bazi.female}
              </span>
              {result?.tokensUsed && (
                <span className="ml-auto" style={{ color: c.textMuted }}>
                  {result.tokensUsed} tokens
                </span>
              )}
            </div>

            {/* BaZi Chart */}
            {chartData && (
              <BaziChart
                pillars={baziData}
                tenGods={chartData.tenGods}
                naYin={chartData.naYin}
                hiddenStems={chartData.hiddenStems}
                dayMasterIndex={baziData.dayMasterIndex}
                dayMasterElement={baziData.dayMasterElement}
                dayMasterYinYang={baziData.dayMasterYinYang}
                elementCounts={baziData.elementCounts}
                zodiac={baziData.day.zodiac.split(" ")[0]}
              />
            )}

            {/* AI interpretation */}
            {result?.reading && (result.reading.preview || result.reading.overview) && (
              <div
                className="rounded-xl p-6"
                style={{ background: c.surface, border: `1px solid ${c.primary}18` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} style={{ color: c.primary }} />
                  <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: c.primary }}>
                    {t.bazi.aiReading}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: c.text }}>
                  {result.reading.preview || result.reading.overview}
                </p>
              </div>
            )}

            {/* Report tabs */}
            <div className="space-y-4">
              <div className="text-xs font-bold tracking-wider uppercase" style={{ color: c.textMuted }}>
                {t.bazi.inDepthReports}
              </div>

              {/* Tab bar */}
              <div
                className="flex rounded-lg overflow-hidden"
                style={{ border: `1px solid ${c.primary}18` }}
              >
                {(["annual", "personality", "deep"] as const).map((key, idx) => {
                  const info = reportLabels[key];
                  const isActive = selectedReport === key;
                  const isDone = reportResult?.type === key && reportResult.reading;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleReportClick(key)}
                      className="flex-1 py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                      style={{
                        background: isActive ? `${c.primary}14` : "transparent",
                        color: isDone ? "#2ECC71" : isActive ? c.primary : c.textMuted,
                        borderRight: idx < 2 ? `1px solid ${c.primary}18` : "none",
                      }}
                    >
                      {isDone ? (
                        <Sparkles size={11} style={{ color: "#2ECC71" }} />
                      ) : (
                        <Lock size={11} />
                      )}
                      {info.title}
                    </button>
                  );
                })}
              </div>

              {/* Tab content panel */}
              {selectedReport && (
                <div
                  className="rounded-xl p-5 animate-fade-in"
                  style={{ background: c.surface, border: `1px solid ${c.primary}18` }}
                >
                  {/* Loading state */}
                  {reportLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-6">
                      <Loader2 size={24} className="animate-spin" style={{ color: c.primary }} />
                      <span className="text-xs font-semibold" style={{ color: c.primary }}>
                        {t.bazi.generating}
                      </span>
                    </div>
                  ) : reportResult?.reading && reportResult.type === selectedReport ? (
                    /* Report result — shown inline */
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} style={{ color: "#2ECC71" }} />
                        <span className="text-xs font-semibold" style={{ color: "#2ECC71" }}>
                          {t.bazi.unlocked}
                        </span>
                      </div>
                      {reportResult.reading.overview && (
                        <p className="text-sm leading-relaxed" style={{ color: c.text }}>
                          {reportResult.reading.overview}
                        </p>
                      )}
                      {reportResult.reading.advice && (
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            background: `linear-gradient(135deg, ${c.primary}10 0%, ${c.primary}04 100%)`,
                            borderLeft: `3px solid ${c.primary}`,
                          }}
                        >
                          <p className="text-xs italic">&ldquo;{reportResult.reading.advice}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Payment options */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold" style={{ color: c.text }}>
                          {reportLabels[selectedReport].title}
                        </h3>
                        <span className="text-xs font-bold" style={{ color: c.primary }}>
                          ${reportLabels[selectedReport].price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px]" style={{ color: c.textMuted }}>
                        {reportLabels[selectedReport].desc}
                      </p>

                      <button
                        onClick={fetchReportWithPoints}
                        disabled={redeemingPoints}
                        className="w-full py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        style={{
                          background: `linear-gradient(135deg, ${c.primary}22, ${c.primary}0D)`,
                          border: `1px solid ${c.primary}44`,
                          color: c.primary,
                        }}
                      >
                        {redeemingPoints ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        {t.bazi.unlockWithPoints}
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px" style={{ background: c.primary + "18" }} />
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: c.textMuted }}>
                          {t.bazi.or}
                        </span>
                        <div className="flex-1 h-px" style={{ background: c.primary + "18" }} />
                      </div>

                      <PayPalButton
                        amount={reportLabels[selectedReport].price}
                        spreadKey={reportLabels[selectedReport].serviceKey}
                        readingId={`bazi-${selectedReport}-${Date.now()}`}
                        onSuccess={(orderId) => fetchReport(orderId)}
                        onError={(msg) => setError(msg)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CTA for non signed-in */}
            {!isSignedIn && (
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: `linear-gradient(135deg, ${c.primary}10, ${c.primary}04)`, border: `1px solid ${c.primary}18` }}
              >
                <p className="text-sm font-semibold mb-3" style={{ color: c.text }}>
                  {t.bazi.wantFull}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    href={signInWithReturnUrl()}
                    className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                    style={{ background: c.primary, color: c.bg, boxShadow: `0 0 15px ${currentTheme.glow}` }}
                  >
                    {t.bazi.signInRegister}
                  </Link>
                  <Link
                    href="/membership"
                    className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                    style={{ background: "transparent", color: c.primary, border: `1px solid ${c.primary}30` }}
                  >
                    {t.bazi.viewPlans}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
