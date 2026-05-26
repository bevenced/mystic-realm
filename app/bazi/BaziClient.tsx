"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import BaziChart from "@/components/features/BaziChart";
import { getAllTenGods, getNaYin, getHiddenStems, getFortuneStage, getAllFortuneStages } from "@/lib/bazi";
import type { BaZiResult, BaZiPillar } from "@/lib/bazi";
import type { PatternResult, ElementStrengthResult, ShenShaResult, TiaoHouResult, DayPillarGradeResult, PillarRelation } from "@/lib/bazi-engine";
import Link from "next/link";
import {
  Sparkles, Loader2, Lock, Calendar, Clock,
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
    dayMasterStrength?: string;
    usefulGod?: string;
    [key: string]: unknown;
  };
  professionalData?: {
    tenGods?: Array<{ stem: string; tenGodName: string; tenGodEn: string; element: string; relationship: string }>;
    elementStrength?: ElementStrengthResult;
    hiddenStems?: Array<{ branchIndex: number; stems: Array<{ stem: string; element: string; qi: string }> }>;
    shensha?: ShenShaResult[];
    pattern?: PatternResult;
    tiaoHou?: TiaoHouResult;
    dayPillarGrade?: DayPillarGradeResult;
    pillarRelations?: PillarRelation[];
    nayin?: Array<{ pillar: string; element: string; toneName: string; toneNameEn: string }>;
    daYun?: { direction?: string; startAge?: number; cycles?: Array<{ startAge: number; endAge: number; stem: string; branch: string; stemEn?: string; branchElement?: string; isCurrent?: boolean }> };
    currentYearFortune?: { year: number; stem: string; branch: string; description: string };
  };
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

const ELEMENT_COLORS: Record<string, string> = {
  Wood: "#4CAF50", Fire: "#FF5722", Earth: "#FFC107", Metal: "#B0B0B0", Water: "#42A5F5",
};

export default function BaziClient() {
  const { currentTheme, setTheme } = useTheme();
  const c = currentTheme.colors;
  const { isSignedIn } = useAuth();
  const { locale, t } = useLocale();

  // Activate BaZi theme
  useEffect(() => {
    setTheme("bazi");
    return () => setTheme("meditation");
  }, []);

  // Restore form state from URL params (after sign-in redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bd = params.get("birthDate");
    const bh = params.get("birthHour");
    const g = params.get("gender");
    const nm = params.get("name");
    if (bd) setBirthDate(bd);
    if (bh) setBirthHour(Number(bh));
    if (g === "male" || g === "female") setGender(g);
    if (nm) setUserName(nm);
    if (bd && bh) {
      const url = new URL(window.location.href);
      url.searchParams.delete("birthDate");
      url.searchParams.delete("birthHour");
      url.searchParams.delete("gender");
      url.searchParams.delete("name");
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  // Form state
  const [userName, setUserName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthHour, setBirthHour] = useState<number>(8);
  const [gender, setGender] = useState<"male" | "female">("male");

  // Result state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [formExpanded, setFormExpanded] = useState(true);

  // Report payment flow
  const [selectedReport, setSelectedReport] = useState<"annual" | "personality" | "deep" | null>(null);
  const [reportResult, setReportResult] = useState<{ type: string; reading: ApiResponse["reading"] } | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const reportLabels: Record<string, { title: string; desc: string; price: number; serviceKey: string }> = {
    annual: { title: t.bazi.annual.title, desc: t.bazi.annual.desc, price: 3.99, serviceKey: "bazi-annual" },
    personality: { title: t.bazi.personality.title, desc: t.bazi.personality.desc, price: 3.99, serviceKey: "bazi-personality" },
    deep: { title: t.bazi.deep.title, desc: t.bazi.deep.desc, price: 5.99, serviceKey: "bazi-deep" },
  };

  // Build chart data from API response
  const baziData = result?.baziData;
  const pd = result?.professionalData;
  const reading = result?.reading;
  const chartData = (() => {
    if (!baziData) return null;
    const pillarKeys: ("year" | "month" | "day" | "hour")[] = ["year", "month", "day", "hour"];
    const tenGodResults = getAllTenGods(baziData.dayMasterIndex, [
      baziData.year.stemIndex, baziData.month.stemIndex, baziData.day.stemIndex, baziData.hour.stemIndex,
    ]);
    const tenGods = tenGodResults.map((t) => t.tenGodName);
    const tenGodElements = tenGodResults.map((t) => t.element);
    const naYin = pillarKeys.map((k) => getNaYin(baziData[k].stemIndex, baziData[k].branchIndex).toneName);
    const hiddenStems = pillarKeys.map((k) => getHiddenStems(baziData[k].branchIndex));
    const branchIndices = pillarKeys.map((k) => baziData[k].branchIndex);
    const fortuneStages = getAllFortuneStages(baziData.dayMasterIndex, branchIndices);
    const selfSitting = pillarKeys.map((k) => getFortuneStage(baziData[k].stemIndex, baziData[k].branchIndex));
    const shenshaByPillar: ShenShaResult[][] = pillarKeys.map((pk) => {
      const locName = { year: "Year", month: "Month", day: "Day", hour: "Hour" }[pk];
      return (pd?.shensha || []).filter((s: ShenShaResult) => s.locations.includes(locName));
    });
    return { tenGods, tenGodElements, naYin, hiddenStems, fortuneStages, selfSitting, shenshaByPillar };
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
        setFormExpanded(false);
      }
    } catch {
      setError(t.bazi.networkError);
    } finally {
      setLoading(false);
    }
  };

  const [redeemingPoints, setRedeemingPoints] = useState(false);

  const signInWithReturnUrl = () => {
    const returnParams = new URLSearchParams({ birthDate, birthHour: String(birthHour), gender, name: userName });
    return `/sign-in?redirect_url=${encodeURIComponent(`/bazi?${returnParams.toString()}`)}`;
  };

  const loadingMessages = [t.bazi.submitting, "排定四柱...", "分析五行...", "推演十神...", "解读命理..."];
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => setLoadingMsgIdx((i) => (i + 1) % loadingMessages.length), 1800);
    return () => clearInterval(timer);
  }, [loading]);

  const handleReportClick = (type: "annual" | "personality" | "deep") => {
    if (!isSignedIn) { window.location.href = signInWithReturnUrl(); return; }
    setSelectedReport(type);
    setShowPayment(true);
    setReportResult(null);
  };

  const fetchReport = async (orderId: string) => {
    if (!selectedReport || !birthDate) return;
    setShowPayment(false);
    setReportLoading(true);
    await loadReport({ orderId });
  };

  const fetchReportWithPoints = async () => {
    if (!selectedReport || !birthDate) return;
    setRedeemingPoints(true);
    try {
      const redeemRes = await fetch("/api/redeem", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: reportLabels[selectedReport].serviceKey }),
      });
      const redeemData = await redeemRes.json();
      if (redeemData.error) { setError(redeemData.error); setRedeemingPoints(false); return; }
      setShowPayment(false);
      setReportLoading(true);
      setRedeemingPoints(false);
      await loadReport({ redeemed: redeemData.token });
    } catch { setError(t.bazi.redeemFailed); setRedeemingPoints(false); }
  };

  const loadReport = async (extra: { orderId?: string; redeemed?: string }) => {
    setReportLoading(true);
    try {
      const res = await fetch("/api/ai-bazi", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, birthHour, gender, reportType: selectedReport, locale, ...extra }),
      });
      const json = await res.json();
      if (json.error) setError(json.error);
      else setReportResult({ type: selectedReport!, reading: json.reading });
    } catch { setError(t.bazi.networkError); }
    finally { setReportLoading(false); }
  };

  const formatDate = (d: string) => {
    if (!d) return "";
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
  };

  const elLabel = (elem: string) => (t.dailyFortune.elements as Record<string, string>)[elem] || elem;

  const elColor = (elem: string) => ELEMENT_COLORS[elem] || c.textMuted;

  return (
    <main className="min-h-screen">
      <div className="absolute inset-0 pointer-events-none" style={{ height: "400px", background: `radial-gradient(ellipse at 50% 0%, ${c.primary}10 0%, transparent 70%)` }} />

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6 pt-12 pb-20">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold font-serif" style={{ color: c.text }}>{t.bazi.title} | BaZi Natal Chart</h1>
        </div>

        {/* Form / Summary Bar */}
        {result && !formExpanded ? (
          <div
            className="flex flex-wrap items-center gap-2 px-4 py-2 mb-6 rounded-lg animate-fade-in cursor-pointer"
            style={{ background: c.surface, border: `1px solid ${c.primary}0F` }}
            onClick={() => setFormExpanded(true)}
          >
            {userName && <span className="text-xs font-semibold" style={{ color: c.text }}>{userName}</span>}
            <span className="text-[10px]" style={{ color: c.textMuted }}>{formatDate(birthDate)}</span>
            <span className="text-[10px] font-semibold" style={{ color: c.primary }}>{(HOUR_OPTIONS.find((h) => h.v === birthHour)?.[locale.startsWith("zh") ? "label" : "en"] || "").split(" ")[0]}</span>
            <span className="text-[10px]" style={{ color: c.textMuted }}>{gender === "male" ? t.bazi.male : t.bazi.female}</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${c.primary}14`, color: c.primary }}>{t.bazi.submit}</span>
          </div>
        ) : (
          <div className="relative rounded-xl p-4 mb-6 animate-fade-in" style={{ background: c.surface, border: `1px solid ${c.primary}0F` }}>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Row 1: Name + Gender */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: c.textMuted }}>{t.bazi.name}</label>
                  <input
                    type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
                    placeholder={t.bazi.namePlaceholder}
                    className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                    style={{ background: `${c.primary}06`, color: c.text, borderColor: `${c.primary}14` }}
                  />
                </div>
                <div className="flex-shrink-0">
                  <label className="block text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: c.textMuted }}>{t.bazi.gender}</label>
                  <div className="flex gap-1.5">
                    {(["male", "female"] as const).map((g) => (
                      <button key={g} type="button" onClick={() => setGender(g)}
                        className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                        style={{ background: gender === g ? `${c.primary}18` : `${c.primary}06`, color: gender === g ? c.primary : c.textMuted, border: `1px solid ${gender === g ? c.primary : `${c.primary}14`}` }}>
                        {g === "male" ? t.bazi.male : t.bazi.female}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Date + Hour */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: c.textMuted }}>
                    <Calendar size={11} />{t.bazi.birthDate}
                  </label>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required
                    className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                    style={{ background: `${c.primary}06`, color: c.text, borderColor: `${c.primary}14` }} />
                </div>
                <div className="flex-1">
                  <label className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: c.textMuted }}>
                    <Clock size={11} />{t.bazi.birthHour}
                  </label>
                  <select value={birthHour} onChange={(e) => setBirthHour(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                    style={{ background: `${c.primary}06`, color: c.text, borderColor: `${c.primary}14` }}>
                    {HOUR_OPTIONS.map((h) => (
                      <option key={h.v} value={h.v}>{locale.startsWith("zh") ? h.label : h.en}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-[10px]" style={{ color: c.textMuted }}>{t.bazi.birthHourHint}</p>

              {/* Submit */}
              <button type="submit" disabled={loading || !birthDate}
                className="w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                style={{ background: loading || !birthDate ? `${c.primary}30` : c.primary, color: loading ? c.textMuted : c.bg, cursor: loading || !birthDate ? "not-allowed" : "pointer", boxShadow: loading ? "none" : `0 0 20px ${currentTheme.glow}` }}>
                <Sparkles size={16} /> {t.bazi.submit}
              </button>

              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl z-10" style={{ background: `${c.surface}F2` }}>
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full animate-spin" style={{ border: `2px solid transparent`, borderTopColor: c.primary, borderRightColor: `${c.primary}60` }} />
                    <div className="absolute inset-2 rounded-full" style={{ border: `2px solid transparent`, borderBottomColor: `${c.primary}40`, borderLeftColor: `${c.primary}20`, animation: "spin 2s linear infinite reverse" }} />
                    <span className="absolute inset-0 flex items-center justify-center text-lg">☯️</span>
                  </div>
                  <p className="text-xs font-semibold animate-pulse" style={{ color: c.primary }}>{loadingMessages[loadingMsgIdx]}</p>
                </div>
              )}
            </form>

            {error && (
              <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: "#E74C3C14", color: "#E74C3C", border: "1px solid #E74C3C22" }}>{error}</div>
            )}
          </div>
        )}

        {/* Results */}
        {baziData && (
          <div className="space-y-4 animate-fade-in">
            {/* BaZi Chart */}
            {chartData && (
              <BaziChart
                pillars={baziData}
                naYin={chartData.naYin}
                hiddenStems={chartData.hiddenStems}
                fortuneStages={chartData.fortuneStages}
                shenshaByPillar={chartData.shenshaByPillar}
                dayMasterIndex={baziData.dayMasterIndex}
                dayMasterElement={baziData.dayMasterElement}
                dayMasterYinYang={baziData.dayMasterYinYang}
                elementCounts={baziData.elementCounts}
                zodiac={baziData.day.zodiac.split(" ")[0]}
                tenGods={chartData.tenGods}
                tenGodElements={chartData.tenGodElements}
                selfSitting={chartData.selfSitting}
              />
            )}

            {/* Overview */}
            {reading?.overview && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: c.textMuted }}>{t.bazi.overview || "概述"}</span>
              </div>
              <div className="rounded-lg p-3" style={{ background: c.surface, border: `1px solid ${c.primary}08` }}>
                <p className="text-[11px] leading-relaxed" style={{ color: c.text }}>
                  {"📌 "}{reading.overview.slice(0, 200)}{reading.overview.length > 200 ? "…" : ""}
                </p>
              </div>
            </div>)}

            {/* Pillar Relations */}
            {pd?.pillarRelations && pd.pillarRelations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: c.textMuted }}>{t.bazi.pillarRelations}</span>
              </div>
              <div className="rounded-lg p-3" style={{ background: c.surface, border: `1px solid ${c.primary}08` }}>
                {/* Visual pillar relationship grid */}
                <div className="flex items-center justify-center gap-0 mb-3">
                  {(["Year","Month","Day","Hour"] as const).map((pk, pi) => (
                    <div key={pk} className="flex items-center">
                      <div className="text-center px-2 py-1 rounded" style={{ background: `${c.primary}0F`, border: `1px solid ${c.primary}1A` }}>
                        <span className="text-[10px] font-semibold" style={{ color: c.primary }}>
                          {({ Year: t.bazi.yearPillar, Month: t.bazi.monthPillar, Day: t.bazi.dayPillar, Hour: t.bazi.hourPillar })[pk]}
                        </span>
                      </div>
                      {pi < 3 && (() => {
                        const rel = pd.pillarRelations!.find(r =>
                          (r.fromIndex === pi && r.toIndex === pi + 1) ||
                          (r.fromIndex === pi + 1 && r.toIndex === pi)
                        );
                        const relSymbol: Record<string, { sym: string; c: string }> = {
                          combine: { sym: "合", c: "#2ECC71" },
                          clash: { sym: "冲", c: "#E74C3C" },
                          harm: { sym: "害", c: "#FF9800" },
                          punish: { sym: "刑", c: "#9B59B6" },
                          tripleCombine: { sym: "三合", c: "#3498DB" },
                        };
                        const info = rel ? relSymbol[rel.type] : null;
                        return (
                          <div className="flex flex-col items-center mx-0.5">
                            <div className="h-px w-6" style={{ background: info ? info.c : `${c.primary}14` }} />
                            {info && (
                              <span className="text-[9px] font-bold px-1 rounded" style={{ color: info.c, background: `${info.c}18` }}>
                                {info.sym}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
                {/* Triple combine row if exists */}
                {pd.pillarRelations.filter(r => r.type === "tripleCombine").map((rel, idx) => (
                  <div key={`tc-${idx}`} className="text-center mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold" style={{ background: "#3498DB18", color: "#3498DB", border: "1px solid #3498DB22" }}>
                      三合 {rel.labelEn} ({rel.pillars.map((p) => ({ Year: t.bazi.yearPillar, Month: t.bazi.monthPillar, Day: t.bazi.dayPillar, Hour: t.bazi.hourPillar })[p] || p).join(" - ")})
                    </span>
                  </div>
                ))}
                {/* Description */}
                <p className="text-[11px] leading-relaxed mb-2" style={{ color: c.text }}>
                  {pd.pillarRelations.map((r) => r.description).join("")}
                </p>
                {/* Tag chips */}
                <div className="flex flex-wrap gap-2">
                  {pd.pillarRelations.filter(r => r.type !== "tripleCombine").map((rel, idx) => {
                    const typeColors: Record<string, { bg: string; fg: string }> = {
                      combine: { bg: "#2ECC7118", fg: "#2ECC71" },
                      clash: { bg: "#E74C3C18", fg: "#E74C3C" },
                      harm: { bg: "#FF980018", fg: "#FF9800" },
                      punish: { bg: "#9B59B618", fg: "#9B59B6" },
                    };
                    const tc = typeColors[rel.type] || { bg: `${c.primary}14`, fg: c.primary };
                    const pillarLabelMap: Record<string, string> = {
                      Year: t.bazi.yearPillar, Month: t.bazi.monthPillar,
                      Day: t.bazi.dayPillar, Hour: t.bazi.hourPillar,
                    };
                    return (
                      <div key={idx} className="text-[10px] px-2 py-1 rounded flex items-center gap-1"
                        style={{ background: tc.bg, color: tc.fg, border: `1px solid ${tc.fg}22` }}>
                        <span className="font-semibold">{rel.labelEn}</span>
                        <span style={{ opacity: 0.7 }}>
                          ({rel.pillars.map((p) => pillarLabelMap[p] || p).join(" - ")})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>)}

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: c.textMuted }}>{t.bazi.dayPillarGrade}</span>
              </div>
                {pd?.dayPillarGrade && (
                  <div className="rounded-lg p-3" style={{ background: `${c.primary}08`, border: `1px solid ${c.primary}0F` }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm" style={{ color: c.accent }}>{"★".repeat(pd.dayPillarGrade.stars)}{"☆".repeat(5 - pd.dayPillarGrade.stars)}</span>
                      <span className="text-[10px] font-bold" style={{ color: c.primary }}>{pd.dayPillarGrade.grade}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: c.text }}>{pd.dayPillarGrade.profile}</p>
                  </div>
                )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: c.textMuted }}>{t.bazi.dayMasterStrength}</span>
              </div>
                {pd?.elementStrength && (
                  <div className="rounded-lg p-3" style={{ background: c.surface, border: `1px solid ${c.primary}08` }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: `${c.primary}12` }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pd.elementStrength.dayMasterStrength.score}%`, background: c.primary }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: c.primary }}>{pd.elementStrength.dayMasterStrength.score}/100</span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: c.text }}>{pd.elementStrength.dayMasterStrength.description}</p>
                    <div className="flex gap-2 mt-2 text-[10px]">
                      {Object.entries(pd.elementStrength.weightedScores).map(([el, sc]) => (
                        <span key={el} style={{ color: elColor(el) }}>{elLabel(el)} {sc}</span>
                      ))}
                    </div>
                    {pd.elementStrength.seasonalStrength && (
                      <p className="text-[10px] mt-1" style={{ color: c.textMuted }}>
                        {pd.elementStrength.seasonalStrength.dmInSeason ? `· ${t.bazi.strong}` : `· ${t.bazi.weak}`}
                      </p>
                    )}
                  </div>
                )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: c.textMuted }}>{t.bazi.usefulGodTab}</span>
              </div>
                {pd?.elementStrength?.usefulGod && (
                  <div className="rounded-lg p-3" style={{ background: `${c.primary}08`, border: `1px solid ${c.primary}0F` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold" style={{ color: elColor(pd.elementStrength.usefulGod.element) }}>{elLabel(pd.elementStrength.usefulGod.element)}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: c.text }}>{pd.elementStrength.usefulGod.reason}</p>
                  </div>
                )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: c.textMuted }}>{t.bazi.tiaoHou}</span>
              </div>
                {pd?.tiaoHou && pd.tiaoHou.stems.length > 0 && (
                  <div className="rounded-lg p-3" style={{ background: `${c.primary}08`, border: `1px solid ${c.primary}0F` }}>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {pd.tiaoHou.stems.map((s) => (
                        <span key={s} className="text-sm font-bold px-2 py-1 rounded" style={{ color: c.primary, background: `${c.primary}14`, border: `1px solid ${c.primary}30` }}>{s}</span>
                      ))}
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: c.text }}>{pd.tiaoHou.reason}</p>
                  </div>
                )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: c.textMuted }}>{t.bazi.chartPattern}</span>
              </div>
                {pd?.pattern && (
                  <div className="rounded-lg p-3" style={{ background: c.surface, border: `1px solid ${c.primary}08` }}>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const categoryColors: Record<string, { bg: string; fg: string }> = {
                          standard: { bg: "#3498DB18", fg: "#3498DB" },
                          jianLu: { bg: "#2ECC7118", fg: "#2ECC71" },
                          yueRen: { bg: "#E74C3C18", fg: "#E74C3C" },
                        };
                        const cc = categoryColors[pd.pattern!.category] || { bg: `${c.primary}14`, fg: c.primary };
                        return (
                          <span className="text-[10px] px-2 py-1 rounded font-semibold" style={{ background: cc.bg, color: cc.fg, border: `1px solid ${cc.fg}22` }}>
                            {pd.pattern!.name} ({pd.pattern!.nameEn})
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-[11px] leading-relaxed mt-2" style={{ color: c.text }}>{pd.pattern.description}</p>
                  </div>
                )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: c.textMuted }}>{t.bazi.shenShaTab}</span>
              </div>
                {pd?.shensha && pd.shensha.length > 0 ? (
                  <div className="rounded-lg p-3" style={{ background: c.surface, border: `1px solid ${c.primary}08` }}>
                    <div className="space-y-2">
                      {(["Year", "Month", "Day", "Hour"]).map((loc) => {
                        const stars = (pd.shensha || []).filter((s: ShenShaResult) => s.locations.includes(loc));
                        if (stars.length === 0) return null;
                        const locLabel = { Year: t.bazi.yearPillar, Month: t.bazi.monthPillar, Day: t.bazi.dayPillar, Hour: t.bazi.hourPillar }[loc];
                        return (
                          <div key={loc}>
                            <div className="text-[10px] font-semibold mb-1" style={{ color: c.textMuted }}>{locLabel}</div>
                            <div className="flex flex-wrap gap-1.5">
                              {stars.map((s) => (
                                <div key={s.name} className="text-[10px] px-2 py-1 rounded flex items-center gap-1"
                                  style={{ background: s.type === "auspicious" ? "#2ECC7118" : s.type === "sinister" ? "#E74C3C18" : "#FFC10718", color: s.type === "auspicious" ? "#2ECC71" : s.type === "sinister" ? "#E74C3C" : "#FFC107" }}>
                                  {s.type === "auspicious" ? t.bazi.auspicious : s.type === "sinister" ? t.bazi.sinister : t.bazi.neutral} {s.name}
                                </div>
                              ))}
                            </div>
                            {stars.map((s) => (
                              <p key={s.name} className="text-[10px] mt-0.5" style={{ color: c.textMuted }}>{s.description}</p>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-center py-4" style={{ color: c.textMuted }}>—</p>
                )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: c.textMuted }}>大运</span>
              </div>
                {pd?.daYun && (
                  <div className="rounded-lg p-3" style={{ background: c.surface, border: `1px solid ${c.primary}08` }}>
                    <p className="text-[11px]" style={{ color: c.textMuted }}>{t.bazi.wantFull}</p>
                  </div>
                )}
            </div>

            {/* AI Preview — available for free users */}
            {reading?.preview && !reading?.overview && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: c.textMuted }}>{t.bazi.aiReading}</span>
              </div>
                <div className="rounded-lg p-3" style={{ background: `${c.primary}08`, border: `1px solid ${c.primary}0F` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={12} style={{ color: c.primary }} />
                      <span className="text-[10px] font-bold" style={{ color: c.primary }}>{t.bazi.aiReading}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: c.text }}>{reading.preview}</p>
                  </div>
            </div>)}

            {/* Full AI Reading — paid users only */}
            {reading?.overview && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: c.textMuted }}>{t.bazi.aiReading}</span>
              </div>
                <div className="rounded-lg p-3" style={{ background: `${c.primary}08`, border: `1px solid ${c.primary}0F` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={12} style={{ color: c.primary }} />
                      <span className="text-[10px] font-bold" style={{ color: c.primary }}>{t.bazi.aiReading}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: c.text }}>{reading.overview}</p>
                  </div>
            </div>)}

            {reading?.lifeAspects && typeof reading.lifeAspects === "object" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: c.textMuted }}>人生四维</span>
              </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(reading.lifeAspects).map(([k, v]) => {
                      const sectionLabels: Record<string, string> = {
                        personality: t.bazi.personality_,
                        career: t.bazi.career_,
                        relationships: t.bazi.marriage_,
                        health: t.bazi.health_,
                      };
                      return (
                        <div key={k} className="rounded-lg p-3" style={{ background: c.surface, border: `1px solid ${c.primary}08` }}>
                          <div className="text-[10px] font-semibold mb-1" style={{ color: c.primary }}>{sectionLabels[k] || k}</div>
                          <p className="text-[11px] leading-relaxed" style={{ color: c.text }}>{v}</p>
                        </div>
                      );
                    })}
                  </div>
            </div>
            )}

            {reading?.dayMaster && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: c.textMuted }}>{t.bazi.dayMaster}</span>
              </div>
                <div className="rounded-lg p-3" style={{ background: c.surface, border: `1px solid ${c.primary}08`}}>
                  <p className="text-[11px] leading-relaxed" style={{ color: c.text }}>{reading.dayMaster}</p>
                </div>
            </div>
            )}

            {reading?.elementAnalysis && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: c.textMuted }}>{t.bazi.elementAnalysis}</span>
              </div>
                <div className="rounded-lg p-3" style={{ background: c.surface, border: `1px solid ${c.primary}08`}}>
                  <p className="text-[11px] leading-relaxed" style={{ color: c.text }}>
                    {typeof reading.elementAnalysis === "string" ? reading.elementAnalysis : (reading.elementAnalysis).balance || (reading.elementAnalysis).dominant || (reading.elementAnalysis).lacking}
                  </p>
                </div>
            </div>
            )}

            {reading?.affirmation && (
              <div className="rounded-lg p-3 text-center" style={{ background: `linear-gradient(135deg, ${c.primary}10, ${c.primary}04)`, border: `1px solid ${c.primary}0F`}}>
                <p className="text-[11px] font-serif italic" style={{ color: c.primary }}>&ldquo;{reading.affirmation}&rdquo;</p>
              </div>
            )}

            {/* Report tabs */}
            <div className="space-y-4">
              <div className="text-xs font-bold tracking-wider uppercase" style={{ color: c.textMuted }}>{t.bazi.inDepthReports}</div>
              <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${c.primary}0F` }}>
                {(["annual", "personality", "deep"] as const).map((key, idx) => {
                  const info = reportLabels[key];
                  const isActive = selectedReport === key;
                  const isDone = reportResult?.type === key && reportResult.reading;
                  return (
                    <button key={key} type="button" onClick={() => handleReportClick(key)}
                      className="flex-1 py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                      style={{
                        background: isActive ? `${c.primary}14` : "transparent",
                        color: isDone ? "#2ECC71" : isActive ? c.primary : c.textMuted,
                        borderRight: idx < 2 ? `1px solid ${c.primary}18` : "none",
                        borderBottom: isActive ? `2px solid ${c.primary}` : "2px solid transparent",
                      }}>
                      {isDone ? <Sparkles size={11} style={{ color: "#2ECC71" }} /> : <Lock size={11} />}
                      {info.title}
                    </button>
                  );
                })}
              </div>

              {selectedReport && (
                <div className="rounded-xl p-5 animate-fade-in" style={{ background: c.surface, border: `1px solid ${c.primary}0F` }}>
                  {reportLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-6">
                      <Loader2 size={24} className="animate-spin" style={{ color: c.primary }} />
                      <span className="text-xs font-semibold" style={{ color: c.primary }}>{t.bazi.generating}</span>
                    </div>
                  ) : reportResult?.reading && reportResult.type === selectedReport ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} style={{ color: "#2ECC71" }} />
                        <span className="text-xs font-semibold" style={{ color: "#2ECC71" }}>{t.bazi.unlocked}</span>
                      </div>
                      {reportResult.reading.overview && <p className="text-sm leading-relaxed" style={{ color: c.text }}>{reportResult.reading.overview}</p>}
                      {reportResult.reading.advice && (
                        <div className="p-3 rounded-lg" style={{ background: `linear-gradient(135deg, ${c.primary}10 0%, ${c.primary}04 100%)`, borderLeft: `3px solid ${c.primary}` }}>
                          <p className="text-xs italic">&ldquo;{reportResult.reading.advice}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold" style={{ color: c.text }}>{reportLabels[selectedReport].title}</h3>
                        <span className="text-xs font-bold" style={{ color: c.primary }}>${reportLabels[selectedReport].price.toFixed(2)}</span>
                      </div>
                      <p className="text-[11px]" style={{ color: c.textMuted }}>{reportLabels[selectedReport].desc}</p>
                      <button onClick={fetchReportWithPoints} disabled={redeemingPoints}
                        className="w-full py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        style={{ background: `linear-gradient(135deg, ${c.primary}22, ${c.primary}0D)`, border: `1px solid ${c.primary}44`, color: c.primary }}>
                        {redeemingPoints ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {t.bazi.unlockWithPoints}
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px" style={{ background: c.primary + "18" }} /><span className="text-[10px] uppercase tracking-wider" style={{ color: c.textMuted }}>{t.bazi.or}</span>
                        <div className="flex-1 h-px" style={{ background: c.primary + "18" }} />
                      </div>
                      <PayPalButton amount={reportLabels[selectedReport].price} spreadKey={reportLabels[selectedReport].serviceKey} readingId={`bazi-${selectedReport}-${Date.now()}`}
                        onSuccess={(orderId) => fetchReport(orderId)} onError={(msg) => setError(msg)} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CTA */}
            {!isSignedIn && (
              <div className="rounded-xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${c.primary}10, ${c.primary}04)`, border: `1px solid ${c.primary}0F` }}>
                <p className="text-sm font-semibold mb-3" style={{ color: c.text }}>{t.bazi.wantFull}</p>
                <div className="flex items-center justify-center gap-3">
                  <Link href={signInWithReturnUrl()} className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all" style={{ background: c.primary, color: c.bg, boxShadow: `0 0 15px ${currentTheme.glow}` }}>
                    {t.bazi.signInRegister}
                  </Link>
                  <Link href="/membership" className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all" style={{ background: "transparent", color: c.primary, border: `1px solid ${c.primary}30` }}>
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
