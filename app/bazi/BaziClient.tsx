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
  Sparkles, Loader2, Lock, Calendar, Clock, Users, ChevronRight, Download, Share2,
} from "lucide-react";

interface ApiResponse {
  baziData: BaZiResult;
  reading: { preview?: string; overview?: string };
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
  const isZh = locale === "zh-CN" || locale === "zh-TW";

  // Form state
  const [birthDate, setBirthDate] = useState("");
  const [birthHour, setBirthHour] = useState<number>(8);
  const [gender, setGender] = useState<"male" | "female">("male");

  // Result state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);

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
      setError(isZh ? "网络错误，请重试" : "Network error. Please try again.");
    } finally {
      setLoading(false);
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
            {isZh ? "免费 · 无需注册" : "Free · No Registration"}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif" style={{ color: c.text }}>
            {isZh ? "八字排盘" : "BaZi Destiny Chart"}
          </h1>
          <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: c.textMuted }}>
            {isZh
              ? "输入你的出生日期和时辰，获取免费的四柱八字排盘和 AI 解读。无需注册。"
              : "Enter your birth date and time to receive a free Four Pillars BaZi chart with AI interpretation. No registration required."}
          </p>
        </div>

        {/* Form */}
        <div
          className="rounded-xl p-6 mb-8 animate-fade-in"
          style={{ background: c.surface, border: `1px solid ${c.primary}18` }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Birth Date */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: c.textMuted }}>
                <Calendar size={13} />
                {isZh ? "出生日期" : "Birth Date"}
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
                {isZh ? "出生时辰" : "Birth Hour"}
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
                  <option key={h.v} value={h.v}>{isZh ? h.label : h.en}</option>
                ))}
              </select>
              <p className="text-[10px] mt-1" style={{ color: c.textMuted }}>
                {isZh ? "如不确定，可留默认" : "Leave default if unsure"}
              </p>
            </div>

            {/* Gender */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: c.textMuted }}>
                <Users size={13} />
                {isZh ? "性别" : "Gender"}
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
                    {isZh ? (g === "male" ? "男" : "女") : (g === "male" ? "Male" : "Female")}
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
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {loading
                ? (isZh ? "正在解读命盘..." : "Reading your destiny...")
                : (isZh ? "生成八字排盘" : "Generate BaZi Chart")}
            </button>
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
                {HOUR_OPTIONS.find((h) => h.v === birthHour)?.label.split(" ")[0]}
              </span>
              <span style={{ color: c.textMuted }}>
                {gender === "male" ? (isZh ? "男" : "Male") : (isZh ? "女" : "Female")}
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
                locale={locale}
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
                    {isZh ? "AI 解读" : "AI Interpretation"}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: c.text }}>
                  {result.reading.preview || result.reading.overview}
                </p>
              </div>
            )}

            {/* Locked report tabs */}
            <div className="space-y-3">
              <div className="text-xs font-bold tracking-wider uppercase" style={{ color: c.textMuted }}>
                {isZh ? "深度报告" : "In-Depth Reports"}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: "annual", title: isZh ? "年度报告" : "Annual Report", desc: isZh ? "2026年度运势详解" : "2026 Yearly Fortune" },
                  { key: "personality", title: isZh ? "个性报告" : "Personality Report", desc: isZh ? "性格与天赋深度分析" : "Personality & Talent Analysis" },
                  { key: "deep", title: isZh ? "深度报告" : "Deep Report", desc: isZh ? "全面命理解读" : "Full Destiny Reading" },
                ].map((report) => (
                  <div
                    key={report.key}
                    className="rounded-xl p-5 relative overflow-hidden group transition-all cursor-pointer"
                    style={{ background: c.surface, border: `1px solid ${c.primary}14` }}
                  >
                    {/* Lock overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                      style={{ background: `${c.bg}CC` }}
                    >
                      <Lock size={20} style={{ color: c.primary }} />
                      <span className="text-xs font-semibold" style={{ color: c.primary }}>
                        {isZh ? "登录/付费解锁" : "Login to Unlock"}
                      </span>
                      {!isSignedIn && (
                        <Link
                          href="/sign-in?redirect_url=/bazi"
                          className="mt-1 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                          style={{ background: c.primary, color: c.bg }}
                        >
                          {isZh ? "免费注册" : "Sign Up Free"}
                        </Link>
                      )}
                      {isSignedIn && (
                        <Link
                          href="/membership"
                          className="mt-1 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                          style={{ background: c.primary, color: c.bg }}
                        >
                          {isZh ? "升级会员" : "Upgrade"}
                        </Link>
                      )}
                    </div>

                    {/* Visible content behind lock */}
                    <h4 className="text-sm font-semibold mb-1" style={{ color: c.text }}>
                      {report.title}
                    </h4>
                    <p className="text-[11px]" style={{ color: c.textMuted }}>
                      {report.desc}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-[10px]" style={{ color: c.primary }}>
                      <ChevronRight size={12} />
                      {isZh ? "查看详情" : "View Details"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA for non signed-in */}
            {!isSignedIn && (
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: `linear-gradient(135deg, ${c.primary}10, ${c.primary}04)`, border: `1px solid ${c.primary}18` }}
              >
                <p className="text-sm font-semibold mb-3" style={{ color: c.text }}>
                  {isZh ? "想要完整的命理解读？" : "Want the full destiny reading?"}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    href="/sign-in?redirect_url=/bazi"
                    className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                    style={{ background: c.primary, color: c.bg, boxShadow: `0 0 15px ${currentTheme.glow}` }}
                  >
                    {isZh ? "登录 / 注册" : "Sign In / Register"}
                  </Link>
                  <Link
                    href="/membership"
                    className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                    style={{ background: "transparent", color: c.primary, border: `1px solid ${c.primary}30` }}
                  >
                    {isZh ? "查看会员方案" : "View Plans"}
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
