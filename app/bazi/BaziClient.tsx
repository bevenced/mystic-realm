"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import BaziChart, { ELEMENT_COLORS } from "@/components/features/BaziChart";
import ElementBars from "@/components/features/bazi/ElementBars";
import DayPillarProfile from "@/components/features/bazi/DayPillarProfile";
import PillarRelations from "@/components/features/bazi/PillarRelations";
import { getAllTenGods, getNaYin, getHiddenStems, getFortuneStage, getAllFortuneStages, getDayPillarProfile } from "@/lib/bazi";
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



export default function BaziClient() {
  const { currentTheme, setTheme } = useTheme();
  const c = currentTheme.colors;
  const { isSignedIn } = useAuth();
  const { locale, t } = useLocale();

  // Activate light BaZi theme on mount
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

  // Derived data for modules
  const dayPillarProfile = baziData ? getDayPillarProfile(baziData.day.stemIndex, baziData.day.branchIndex) : null;

  const elementBarItems = (() => {
    const order = ["木","火","土","金","水"];
    const zhToEn: Record<string, string> = { "木": "Wood", "火": "Fire", "土": "Earth", "金": "Metal", "水": "Water" };
    const colors: Record<string, string> = { "木": "#5CB85C", "火": "#D9534F", "土": "#8B5A2B", "金": "#F0AD4E", "水": "#428BCA" };
    if (!baziData) return [];
    return order.map(zh => ({
      label: zh,
      value: baziData.elementCounts[zhToEn[zh] as keyof typeof baziData.elementCounts] || 0,
      color: colors[zh],
    }));
  })();

  const tenGodBarItems = (() => {
    if (!chartData?.tenGods || !chartData?.tenGodElements) return [];
    const counts: Record<string, number> = {};
    chartData.tenGods.forEach((tg, i) => {
      const short = tg.split(" ")[0]; // take Chinese name only
      counts[short] = (counts[short] || 0) + 1;
    });
    // Ten god + element mapping
    const tgWithEl = chartData.tenGods.map((tg, i) => ({
      label: tg.split(" ")[0],
      element: chartData.tenGodElements![i],
    }));
    // Deduplicate by label, summing
    const merged: Record<string, { count: number; element: string }> = {};
    tgWithEl.forEach(tg => {
      if (!merged[tg.label]) merged[tg.label] = { count: 0, element: tg.element };
      merged[tg.label].count += 1;
    });
    return Object.entries(merged).map(([label, info]) => ({
      label,
      value: info.count,
      color: ELEMENT_COLORS[info.element] || "#888",
    }));
  })();

  const dmIsStrong = pd?.elementStrength?.dayMasterStrength?.isStrong ?? false;
  const zodiacName = baziData?.day.zodiac?.split(" ")[0] || "";

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
            <span className="text-xs" style={{ color: c.textMuted }}>{formatDate(birthDate)}</span>
            <span className="text-xs font-semibold" style={{ color: c.primary }}>{(HOUR_OPTIONS.find((h) => h.v === birthHour)?.[locale.startsWith("zh") ? "label" : "en"] || "").split(" ")[0]}</span>
            <span className="text-xs" style={{ color: c.textMuted }}>{gender === "male" ? t.bazi.male : t.bazi.female}</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: `${c.primary}14`, color: c.primary }}>{t.bazi.submit}</span>
          </div>
        ) : (
          <div className="relative rounded-xl p-4 mb-6 animate-fade-in" style={{ background: c.surface, border: `1px solid ${c.primary}0F` }}>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Row 1: Name + Gender */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: c.textMuted }}>{t.bazi.name}</label>
                  <input
                    type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
                    placeholder={t.bazi.namePlaceholder}
                    className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                    style={{ background: `${c.primary}06`, color: c.text, borderColor: `${c.primary}14` }}
                  />
                </div>
                <div className="flex-shrink-0">
                  <label className="block text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: c.textMuted }}>{t.bazi.gender}</label>
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
                  <label className="flex items-center gap-1 text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: c.textMuted }}>
                    <Calendar size={11} />{t.bazi.birthDate}
                  </label>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required
                    className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                    style={{ background: `${c.primary}06`, color: c.text, borderColor: `${c.primary}14` }} />
                </div>
                <div className="flex-1">
                  <label className="flex items-center gap-1 text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: c.textMuted }}>
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
              <p className="text-xs" style={{ color: c.textMuted }}>{t.bazi.birthHourHint}</p>

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
            {/* ===== 1. Four Pillars Table ===== */}
            {chartData && (
              <BaziChart
                pillars={baziData}
                naYin={chartData.naYin}
                hiddenStems={chartData.hiddenStems}
                fortuneStages={chartData.fortuneStages}
                dayMasterElement={baziData.dayMasterElement}
                dayMasterYinYang={baziData.dayMasterYinYang}
                elementCounts={baziData.elementCounts}
                zodiac={baziData.day.zodiac.split(" ")[0]}
                tenGods={chartData.tenGods}
                tenGodElements={chartData.tenGodElements}
                selfSitting={chartData.selfSitting}
                pillarRelations={pd?.pillarRelations}
                dayPillarGrade={pd?.dayPillarGrade}
                elementStrength={pd?.elementStrength}
                pattern={pd?.pattern}
                shenshaByPillar={chartData.shenshaByPillar}
              />
            )}

            {/* ===== 2. Pattern Module ===== */}
            {pd?.pattern && (
              <Section title="格局">
                <div className="text-center p-3">
                  <span className="text-lg font-bold" style={{ color: c.text }}>{pd.pattern.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded ml-2" style={{
                    background: pd.pattern.category === "standard" ? "#428BCA14" : pd.pattern.category === "jianLu" ? "#5CB85C14" : "#D9534F14",
                    color: pd.pattern.category === "standard" ? "#428BCA" : pd.pattern.category === "jianLu" ? "#5CB85C" : "#D9534F",
                  }}>{pd.pattern.category === "standard" ? "标准格" : pd.pattern.category === "jianLu" ? "建禄格" : "月刃格"}</span>
                </div>
                <div className="mt-2 p-3 rounded flex items-start gap-2" style={{ background: "#FDF8EE", borderLeft: "3px solid #D9534F" }}>
                  <span className="text-xs shrink-0">🔴</span>
                  <p className="text-sm leading-relaxed" style={{ color: "#666" }}>{pd.pattern.description}</p>
                </div>
              </Section>
            )}

            {/* ===== 3. Five Elements Module ===== */}
            <ElementBars
              title="五行"
              items={elementBarItems}
              description={typeof reading?.elementAnalysis === "string" ? reading.elementAnalysis : (reading?.elementAnalysis as any)?.balance}
            />

            {/* ===== 4. Ten Gods Module ===== */}
            {tenGodBarItems.length > 0 && (
              <ElementBars
                title="十神"
                items={tenGodBarItems}
                description="十神分布反映命主与外界的关系模式。正印偏印为贵人学业，正官七杀为事业权威，正财偏财为财富资源，比肩劫财为兄弟朋友，食神伤官为才华创意。"
              />
            )}

            {/* ===== 5. Shensha Module ===== */}
            {pd?.shensha && pd.shensha.length > 0 && (
              <Section title="神煞">
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const categories: Record<string, ShenShaResult[]> = {};
                    pd.shensha.forEach((s: ShenShaResult) => {
                      const cat = (s as any).category || s.type;
                      if (!categories[cat]) categories[cat] = [];
                      categories[cat].push(s);
                    });
                    return Object.entries(categories).map(([cat, stars]) => (
                      <div key={cat} className="w-full">
                        <div className="text-xs font-semibold mb-1.5" style={{ color: "#888" }}>{cat}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {stars.map((s: ShenShaResult) => (
                            <span key={s.name} className="text-xs px-2 py-1 rounded-full"
                              style={{
                                background: s.type === "auspicious" ? "#5CB85C10" : s.type === "sinister" ? "#D9534F10" : "#88888810",
                                color: s.type === "auspicious" ? "#5CB85C" : s.type === "sinister" ? "#D9534F" : "#888888",
                                border: `1px solid ${s.type === "auspicious" ? "#5CB85C22" : s.type === "sinister" ? "#D9534F22" : "#88888822"}`,
                              }}>
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </Section>
            )}

            {/* ===== 6. Body Strength + Useful God + TiaoHou ===== */}
            <Section title="身强身弱 · 喜用神 · 调候">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {pd?.elementStrength && (
                  <div className="rounded p-3 text-center" style={{ background: "#FBF8F2" }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: "#888" }}>身强身弱</div>
                    <div className="text-lg font-bold" style={{ color: dmIsStrong ? "#D9534F" : "#428BCA" }}>
                      {dmIsStrong ? "身强" : "身弱"}
                    </div>
                    <div className="text-xs" style={{ color: "#888" }}>{pd.elementStrength.dayMasterStrength.description}</div>
                  </div>
                )}
                {pd?.elementStrength?.usefulGod && (
                  <div className="rounded p-3 text-center" style={{ background: "#5CB85C08", border: "1px solid #5CB85C18" }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: "#5CB85C" }}>喜用神</div>
                    <div className="text-lg font-bold" style={{ color: elColor(pd.elementStrength.usefulGod.element) }}>{elLabel(pd.elementStrength.usefulGod.element)}</div>
                    <div className="text-xs mt-1" style={{ color: "#888" }}>{pd.elementStrength.usefulGod.reason.slice(0, 40)}</div>
                  </div>
                )}
                {pd?.tiaoHou && pd.tiaoHou.stems.length > 0 && (
                  <div className="rounded p-3 text-center" style={{ background: "#D9534F08", border: "1px solid #D9534F18" }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: "#D9534F" }}>调候用神</div>
                    <div className="flex justify-center gap-1.5 flex-wrap">
                      {pd.tiaoHou.stems.map((s: string) => (
                        <span key={s} className="text-sm font-bold px-2 py-0.5 rounded" style={{ color: "#D9534F", background: "#D9534F10" }}>{s}</span>
                      ))}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#888" }}>{pd.tiaoHou.reason.slice(0, 40)}</div>
                  </div>
                )}
              </div>
            </Section>

            {/* ===== 7. Day Pillar Profile ===== */}
            {dayPillarProfile && pd?.dayPillarGrade && (
              <DayPillarProfile grade={pd.dayPillarGrade} profile={dayPillarProfile} />
            )}

            {/* ===== 8. Pillar Relations Diagram ===== */}
            {pd?.pillarRelations && pd.pillarRelations.length > 0 && (
              <PillarRelations relations={pd.pillarRelations} />
            )}

            {/* ===== 9. Yin Yang Module ===== */}
            <Section title="阴阳">
              <div className="rounded-lg p-4" style={{ background: "#FFFFFF", border: "1px solid #E8DEC9" }}>
                <div className="flex items-center gap-4">
                  <svg width="64" height="64" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="30" fill="none" stroke="#5D4E37" strokeWidth="1.5" />
                    <path d="M32 2 A30 30 0 0 1 32 62 A15 15 0 0 0 32 32 A15 15 0 0 1 32 2Z" fill="#333" />
                    <circle cx="32" cy="17" r="4" fill="#FFF" />
                    <circle cx="32" cy="47" r="4" fill="#333" />
                  </svg>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "#5D4E37" }}>
                      日主{baziData.dayMasterYinYang === "阳" ? "阳" : "阴"}性
                    </div>
                    <p className="text-xs leading-relaxed mt-1" style={{ color: "#666" }}>
                      {baziData.dayMasterYinYang === "阳"
                        ? "阳干外向主动，如烈日当空，积极进取，善于开创。"
                        : "阴干内敛柔韧，如月华如水，细腻敏感，善于守成。"}
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* ===== 10. Zodiac Module ===== */}
            <Section title="生肖">
              <div className="rounded-lg p-4 text-center" style={{ background: "#FFFFFF", border: "1px solid #E8DEC9" }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold"
                  style={{ background: "#FBF8F2", color: "#5D4E37", border: "2px solid #C4A040" }}>
                  {zodiacName}
                </div>
                <p className="text-xs leading-relaxed mt-3" style={{ color: "#666" }}>
                  生肖{zodiacName}，{baziData.dayMasterYinYang === "阳" ? "性格刚健，行事果决" : "性格柔顺，心思细腻"}。
                  与四柱地支形成三合六合则为吉，相冲相害则需留意。
                </p>
              </div>
            </Section>

            {/* AI Preview — available for free users */}
            {reading?.preview && !reading?.overview && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-sm font-bold" style={{ color: c.textMuted }}>{t.bazi.aiReading}</span>
              </div>
                <div className="rounded-lg p-3" style={{ background: `${c.primary}08`, border: `1px solid ${c.primary}0F` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={12} style={{ color: c.primary }} />
                      <span className="text-xs font-bold" style={{ color: c.primary }}>{t.bazi.aiReading}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: c.text }}>{reading.preview}</p>
                  </div>
            </div>)}

            {/* Full AI Reading — paid users only */}
            {reading?.overview && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-sm font-bold" style={{ color: c.textMuted }}>{t.bazi.aiReading}</span>
              </div>
                <div className="rounded-lg p-3" style={{ background: `${c.primary}08`, border: `1px solid ${c.primary}0F` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={12} style={{ color: c.primary }} />
                      <span className="text-xs font-bold" style={{ color: c.primary }}>{t.bazi.aiReading}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: c.text }}>{reading.overview}</p>
                  </div>
            </div>)}

            {reading?.lifeAspects && typeof reading.lifeAspects === "object" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-sm font-bold" style={{ color: c.textMuted }}>人生四维</span>
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
                          <div className="text-xs font-semibold mb-1" style={{ color: c.primary }}>{sectionLabels[k] || k}</div>
                          <p className="text-sm leading-relaxed" style={{ color: c.text }}>{v}</p>
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
                <span className="text-sm font-bold" style={{ color: c.textMuted }}>{t.bazi.dayMaster}</span>
              </div>
                <div className="rounded-lg p-3" style={{ background: c.surface, border: `1px solid ${c.primary}08`}}>
                  <p className="text-sm leading-relaxed" style={{ color: c.text }}>{reading.dayMaster}</p>
                </div>
            </div>
            )}

            {reading?.elementAnalysis && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: c.primary }} />
                <span className="text-sm font-bold" style={{ color: c.textMuted }}>{t.bazi.elementAnalysis}</span>
              </div>
                <div className="rounded-lg p-3" style={{ background: c.surface, border: `1px solid ${c.primary}08`}}>
                  <p className="text-sm leading-relaxed" style={{ color: c.text }}>
                    {typeof reading.elementAnalysis === "string" ? reading.elementAnalysis : (reading.elementAnalysis).balance || (reading.elementAnalysis).dominant || (reading.elementAnalysis).lacking}
                  </p>
                </div>
            </div>
            )}

            {reading?.affirmation && (
              <div className="rounded-lg p-3 text-center" style={{ background: `linear-gradient(135deg, ${c.primary}10, ${c.primary}04)`, border: `1px solid ${c.primary}0F`}}>
                <p className="text-sm font-serif italic" style={{ color: c.primary }}>&ldquo;{reading.affirmation}&rdquo;</p>
              </div>
            )}

            {/* Report tabs */}
            <div className="space-y-4">
              <div className="text-sm font-bold uppercase" style={{ color: c.textMuted }}>{t.bazi.inDepthReports}</div>
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
                      <p className="text-sm" style={{ color: c.textMuted }}>{reportLabels[selectedReport].desc}</p>
                      <button onClick={fetchReportWithPoints} disabled={redeemingPoints}
                        className="w-full py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        style={{ background: `linear-gradient(135deg, ${c.primary}22, ${c.primary}0D)`, border: `1px solid ${c.primary}44`, color: c.primary }}>
                        {redeemingPoints ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {t.bazi.unlockWithPoints}
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px" style={{ background: c.primary + "18" }} /><span className="text-xs uppercase tracking-wider" style={{ color: c.textMuted }}>{t.bazi.or}</span>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: "#5D4E37" }}>{title}</span>
        <div className="w-4 h-4 rounded-full border flex items-center justify-center text-xs font-bold cursor-help"
          style={{ borderColor: "#C4A040", color: "#C4A040" }}>i</div>
      </div>
      {children}
    </div>
  );
}
