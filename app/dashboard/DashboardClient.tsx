"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import DailyCheckin from "@/components/features/DailyCheckin";
import DailyWish from "@/components/features/DailyWish";
import { Sparkles, Calendar, Zap, TrendingUp, Gift } from "lucide-react";
import SafeHtml from "@/components/features/SafeHtml";
import type { StructuredFortune } from "@/lib/ai-fortune";

interface SubStatus {
  plan: string;
  planName: string;
  isActive: boolean;
  expiresAt: string | null;
  features: string[];
  readingsLimit: number;
  readingsThisMonth: number;
  totalPoints: number;
}

interface CheckinHistoryItem {
  checkin_date: string;
  streak: number;
  points_earned: number;
  fortune: string;
  fortuneData?: StructuredFortune | null;
}

export default function DashboardClient() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;
  const { isSignedIn, isLoaded } = useAuth();

  const [subStatus, setSubStatus] = useState<SubStatus | null>(null);
  const [checkinData, setCheckinData] = useState<{
    checkedIn: boolean;
    today: { streak: number; pointsEarned: number; fortune: string; fortuneData?: StructuredFortune | null } | null;
    baziContext?: {
      dayMaster: string;
      dayMasterElement: string;
      zodiac: string;
      elementCounts: Record<string, number>;
      todayStem: string;
      todayBranch: string;
      todayStemEn: string;
      todayBranchEn: string;
      todayElement: string;
    } | null;
    totalPoints: number;
    recentHistory: CheckinHistoryItem[];
  } | null>(null);
  const fetchData = useCallback(async () => {
    try {
      const [subRes, checkinRes] = await Promise.all([
        fetch("/api/subscriptions/status").then((r) => r.json()),
        fetch("/api/checkin").then((r) => r.json()),
      ]);
      if (!subRes.error) setSubStatus(subRes);
      if (!checkinRes.error) setCheckinData(checkinRes);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) fetchData();
  }, [isSignedIn, fetchData]);

  const handleCheckinComplete = () => {
    fetchData();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen">
        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: c.text }}>Sign in to view your dashboard</h1>
          <Link
            href="/sign-in"
            className="inline-block px-8 py-3 rounded-full text-base font-semibold transition-all"
            style={{ backgroundColor: c.primary, color: isDark ? c.bg : "#FFFFFF" }}
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatShortDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <main className="min-h-screen">
      <div className="relative">
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${c.primary}12 0%, transparent 50%)` }}
        />

        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-20">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-3xl font-bold" style={{ color: c.primary }}>Your Dashboard</h1>
            <p className="text-sm mt-2" style={{ color: c.textMuted }}>
              Track your mystical journey
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column — check-in + stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Daily Check-in */}
              <DailyCheckin isSignedIn={isSignedIn} initialData={checkinData} />

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4">
                <div
                  className="rounded-xl p-4 text-center"
                  style={{ background: c.surface, border: `1px solid ${c.primary}22` }}
                >
                  <Calendar size={18} className="mx-auto mb-2" style={{ color: c.primary }} />
                  <p className="text-2xl font-bold" style={{ color: c.text }}>
                    {checkinData?.today?.streak || 0}
                  </p>
                  <p className="text-xs" style={{ color: c.textMuted }}>Day Streak</p>
                </div>
                <div
                  className="rounded-xl p-4 text-center"
                  style={{ background: c.surface, border: `1px solid ${c.primary}22` }}
                >
                  <Zap size={18} className="mx-auto mb-2" style={{ color: c.primary }} />
                  <p className="text-2xl font-bold" style={{ color: c.text }}>
                    {subStatus?.readingsThisMonth || 0}
                  </p>
                  <p className="text-xs" style={{ color: c.textMuted }}>Readings</p>
                </div>
                <div
                  className="rounded-xl p-4 text-center"
                  style={{ background: c.surface, border: `1px solid ${c.primary}22` }}
                >
                  <Gift size={18} className="mx-auto mb-2" style={{ color: c.primary }} />
                  <p className="text-2xl font-bold" style={{ color: c.text }}>
                    {subStatus?.totalPoints || checkinData?.totalPoints || 0}
                  </p>
                  <p className="text-xs" style={{ color: c.textMuted }}>Points</p>
                </div>
              </div>

              {/* Check-in history */}
              {checkinData?.recentHistory && checkinData.recentHistory.length > 0 && (
                <div
                  className="rounded-xl p-6"
                  style={{ background: c.surface, border: `1px solid ${c.primary}22` }}
                >
                  <h3 className="text-sm font-semibold tracking-wider uppercase mb-4" style={{ color: c.primary }}>
                    Recent Check-ins
                  </h3>
                  <div className="space-y-3">
                    {checkinData.recentHistory.slice(0, 7).map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 pb-3"
                        style={{ borderBottom: i < checkinData.recentHistory.length - 1 ? `1px solid ${c.primary}10` : "none" }}
                      >
                        <div className="text-xs font-mono whitespace-nowrap mt-0.5" style={{ color: c.textMuted, minWidth: 50 }}>
                          {formatShortDate(item.checkin_date)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs italic" style={{ color: c.text }}>
                            &ldquo;{item.fortuneData ? item.fortuneData.advice : item.fortune}&rdquo;
                          </p>
                        </div>
                        <div className="text-xs whitespace-nowrap text-right" style={{ color: c.textMuted }}>
                          +{item.points_earned} pts &middot; {item.streak}d
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column — subscription status */}
            <div className="space-y-6">
              {/* Subscription card */}
              <div
                className="rounded-xl p-6"
                style={{
                  background: subStatus?.isActive
                    ? `linear-gradient(135deg, ${c.primary}15 0%, ${c.surface} 100%)`
                    : c.surface,
                  border: `1px solid ${c.primary}22`,
                }}
              >
                <h3 className="text-sm font-semibold tracking-wider uppercase mb-4" style={{ color: c.primary }}>
                  Membership
                </h3>

                {subStatus?.isActive ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: "#2ECC99" }}
                      />
                      <span className="text-sm font-bold" style={{ color: "#2ECC99" }}>Active</span>
                    </div>
                    <p className="text-3xl font-bold mb-1" style={{ color: c.primary }}>
                      {subStatus.planName}
                    </p>
                    <p className="text-xs mb-4" style={{ color: c.textMuted }}>
                      Expires {formatDate(subStatus.expiresAt)}
                    </p>
                    <div className="w-full rounded-full h-2 mb-3" style={{ background: `${c.primary}20` }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          background: c.primary,
                          width: `${Math.min(100, ((subStatus.readingsThisMonth || 0) / Math.max(1, subStatus.readingsLimit)) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs" style={{ color: c.textMuted }}>
                      {subStatus.readingsThisMonth} / {subStatus.readingsLimit === 999 ? "Unlimited" : subStatus.readingsLimit} readings this month
                    </p>
                    <div className="mt-4">
                      <Link
                        href="/tools"
                        className="block w-full text-center py-2.5 rounded-full text-sm font-semibold transition-all"
                        style={{
                          backgroundColor: c.primary,
                          color: isDark ? c.bg : "#FFFFFF",
                        }}
                      >
                        <Sparkles size={14} className="inline mr-1" />
                        New Reading
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm mb-3" style={{ color: c.text }}>
                      You're on the <strong>Free</strong> plan
                    </p>
                    <p className="text-xs mb-4" style={{ color: c.textMuted }}>
                      Upgrade to Mystic for $9.99/month and get unlimited readings.
                    </p>
                    <Link
                      href="/membership"
                      className="block w-full text-center py-2.5 rounded-full text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: c.primary,
                        color: isDark ? c.bg : "#FFFFFF",
                      }}
                    >
                      <TrendingUp size={14} className="inline mr-1" />
                      Upgrade
                    </Link>
                  </div>
                )}
              </div>

              {/* Points card */}
              <div
                className="rounded-xl p-6"
                style={{ background: c.surface, border: `1px solid ${c.primary}22` }}
              >
                <h3 className="text-sm font-semibold tracking-wider uppercase mb-3" style={{ color: c.primary }}>
                  Points
                </h3>
                <p className="text-3xl font-bold mb-1" style={{ color: c.text }}>
                  {subStatus?.totalPoints || checkinData?.totalPoints || 0}
                </p>
              </div>

              {/* Daily Wish */}
              <DailyWish isSignedIn={isSignedIn} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
