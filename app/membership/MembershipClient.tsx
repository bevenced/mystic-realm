"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { Sparkles, Check, Infinity, FileText, History, Headphones, Zap } from "lucide-react";
import PayPalButton from "@/components/features/PayPalButton";
import Link from "next/link";

interface SubStatus {
  plan: string;
  planName: string;
  isActive: boolean;
  expiresAt: string | null;
  features: string[];
  readingsLimit: number;
  readingsThisMonth: number;
}

const PLANS = [
  {
    id: "free",
    nameKey: "free" as const,
    price: 0,
    period: "",
    popular: false,
    features: ["freePreviews", "basicGuidance"] as const,
    cta: "Always free",
  },
  {
    id: "mystic-weekly",
    nameKey: "mystic" as const,
    price: 2.99,
    period: "weekly",
    popular: false,
    features: ["unlimitedReadings", "fullInterpretations", "readingHistory", "exportPdf"] as const,
    cta: "Subscribe $2.99/week",
    badge: "bestValue" as const,
  },
  {
    id: "mystic",
    nameKey: "mystic" as const,
    price: 9.99,
    period: "monthly",
    popular: true,
    features: ["unlimitedReadings", "fullInterpretations", "readingHistory", "exportPdf", "prioritySupport"] as const,
    cta: "Subscribe $9.99/month",
    badge: "mostPopular" as const,
  },
  {
    id: "mystic-yearly",
    nameKey: "mystic" as const,
    price: 99.99,
    period: "yearly",
    popular: false,
    features: ["unlimitedReadings", "fullInterpretations", "readingHistory", "exportPdf", "prioritySupport"] as const,
    cta: "Subscribe $99.99/year",
    badge: "savePercent" as const,
    saveAmount: "$19.89",
  },
];

const FEATURE_ICONS: Record<string, any> = {
  freePreviews: Check,
  basicGuidance: Check,
  unlimitedReadings: Infinity,
  fullInterpretations: FileText,
  readingHistory: History,
  exportPdf: FileText,
  prioritySupport: Headphones,
};

export default function MembershipClient() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;
  const { isSignedIn } = useAuth();
  const { t, tf, locale } = useLocale();

  const [subStatus, setSubStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    fetch("/api/subscriptions/status")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setSubStatus(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  const handleSubscribeSuccess = async (orderId: string) => {
    setError("");
    try {
      const res = await fetch("/api/subscriptions/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, planId: "mystic" }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSubStatus({
          plan: "mystic",
          planName: "Mystic",
          isActive: true,
          expiresAt: data.expiresAt,
          features: PLANS[2].features.map((f) => f),
          readingsLimit: 999,
          readingsThisMonth: 0,
        });
      }
    } catch {
      setError(t.common.networkError);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString(locale === "zh-TW" ? "zh-TW" : locale === "zh-CN" ? "zh-CN" : "en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const getFeatureText = (key: string) => {
    const dict = t.membership.features as unknown as Record<string, string>;
    return dict[key] || key;
  };

  return (
    <main className="min-h-screen">
      <div className="relative">
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${c.primary}12 0%, transparent 50%)` }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-20">
          {/* Header */}
          <div className="text-center mb-14 animate-fade-in">
            <div className="w-12 h-px mx-auto mb-6" style={{ background: c.primary }} />
            <div className="flex items-center justify-center gap-3 mb-3">
              <Sparkles size={24} style={{ color: c.primary }} />
              <h1 className="text-3xl md:text-4xl font-bold tracking-wider" style={{ color: c.primary }}>
                {t.membership.title}
              </h1>
              <Sparkles size={24} style={{ color: c.primary }} />
            </div>
            <p className="text-sm max-w-md mx-auto" style={{ color: c.textMuted }}>
              {t.membership.subtitle}
            </p>
          </div>

          {/* Limited-time banner */}
          <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: `linear-gradient(135deg, ${c.primary}20, ${c.primary}08)`, border: `1px solid ${c.primary}30` }}
            >
              <div className="flex items-center justify-center gap-2">
                <Zap size={16} style={{ color: c.primary }} />
                <span className="text-sm font-semibold" style={{ color: c.primary }}>
                  {t.membership.limitedOfferBanner}
                </span>
                <Zap size={16} style={{ color: c.primary }} />
              </div>
            </div>
          </div>

          {/* Already subscribed */}
          {subStatus?.isActive && (
            <div className="animate-fade-in max-w-lg mx-auto mb-8">
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: `${c.primary}08`, border: `1px solid ${c.primary}33` }}
              >
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-3"
                  style={{ background: "#2ECC9915", color: "#2ECC99" }}
                >
                  <Check size={14} /> {t.membership.active}
                </div>
                <h2 className="text-lg font-bold mb-1" style={{ color: c.text }}>{t.membership.mysticMember}</h2>
                <p className="text-sm" style={{ color: c.textMuted }}>
                  {t.membership.readingsUntil} {formatDate(subStatus.expiresAt)}
                </p>
              </div>
              <div className="text-center mt-6">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-base font-semibold transition-all"
                  style={{
                    backgroundColor: c.primary,
                    color: isDark ? c.bg : "#FFFFFF",
                    boxShadow: `0 0 20px ${currentTheme.glow}`,
                  }}
                >
                  <Sparkles size={18} />
                  {t.membership.startReading}
                </Link>
              </div>
            </div>
          )}

          {/* Plan cards */}
          {!subStatus?.isActive && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto animate-fade-in">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-xl p-5 relative flex flex-col"
                  style={{
                    background: plan.popular
                      ? `linear-gradient(135deg, ${c.primary}15 0%, ${c.surface} 100%)`
                      : c.surface,
                    border: plan.popular
                      ? `2px solid ${c.primary}44`
                      : `1px solid ${c.primary}22`,
                  }}
                >
                  {plan.badge && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase whitespace-nowrap"
                      style={{ background: c.primary, color: isDark ? c.bg : "#FFFFFF" }}
                    >
                      {(t.membership as unknown as Record<string,string>)[plan.badge] || plan.badge}
                    </div>
                  )}

                  <h3 className="text-base font-bold mb-1" style={{ color: c.text }}>
                    {plan.id === "free" ? t.membership.free : t.membership.mystic}
                  </h3>

                  <div className="mb-1">
                    <span className="text-2xl font-bold" style={{ color: c.primary }}>
                      ${plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-xs ml-1" style={{ color: c.textMuted }}>
                        {plan.period === "weekly" ? t.membership.weekly : plan.period === "yearly" ? t.membership.yearly : t.membership.monthly}
                      </span>
                    )}
                  </div>

                  {plan.saveAmount && (
                    <p className="text-xs mb-3" style={{ color: "#4CAF50" }}>
                      {tf("membership.saveVsMonthly", { amount: plan.saveAmount })}
                    </p>
                  )}

                  <div className="text-xs mb-4" style={{ color: c.textMuted }}>
                    {plan.id === "free" ? t.membership.noSignup : t.membership.cancelAnytime}
                  </div>

                  <ul className="space-y-2 mb-5 flex-1">
                    {plan.features.map((f) => {
                      const Icon = FEATURE_ICONS[f] || Check;
                      return (
                        <li key={f} className="flex items-start gap-2 text-xs" style={{ color: c.text }}>
                          <Icon size={12} style={{ color: c.primary, marginTop: 2, flexShrink: 0 }} />
                          {getFeatureText(f)}
                        </li>
                      );
                    })}
                  </ul>

                  {plan.id === "free" ? (
                    <div className="text-center text-xs" style={{ color: c.textMuted }}>
                      {t.membership.alwaysFree}
                    </div>
                  ) : isSignedIn ? (
                    <PayPalButton
                      amount={plan.price}
                      spreadKey="mystic"
                      readingId={crypto.randomUUID()}
                      onSuccess={handleSubscribeSuccess}
                      onError={setError}
                    />
                  ) : (
                    <Link
                      href="/sign-up"
                      className="block w-full text-center py-2.5 rounded-full text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: c.primary,
                        color: isDark ? c.bg : "#FFFFFF",
                      }}
                    >
                      {t.membership.signUpToSubscribe}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Not signed in prompt */}
          {!isSignedIn && !subStatus?.isActive && (
            <div className="text-center mt-10 animate-fade-in">
              <p className="text-sm mb-4" style={{ color: c.textMuted }}>
                {t.membership.signInToManage}
              </p>
              <Link
                href="/sign-in"
                className="inline-block px-8 py-3 rounded-full text-base font-semibold transition-all"
                style={{
                  backgroundColor: c.primary,
                  color: isDark ? c.bg : "#FFFFFF",
                }}
              >
                {t.nav.signIn}
              </Link>
            </div>
          )}

          {error && (
            <p className="text-xs mt-4 text-center" style={{ color: "#E74C3C" }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
