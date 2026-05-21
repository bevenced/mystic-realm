"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import ChartSummary from "@/components/dashboard/ChartSummary";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentReadings from "@/components/dashboard/RecentReadings";
import MembersipCard from "@/components/dashboard/MembershipCard";

interface DashboardData {
  user: {
    name: string;
    email: string;
    plan: string;
    points: number;
    birthDate: string | null;
  };
  recentReadings: any[];
  todayFortune: string | null;
}

export default function DashboardClient() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const { isSignedIn, isLoaded } = useAuth();
  const { t } = useLocale();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetch("/api/dashboard")
        .then((r) => r.json())
        .then((d) => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm animate-pulse" style={{ color: c.textMuted }}>{t.dashboard.loading}</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen">
        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-20 text-center">
          <div className="text-5xl mb-6" style={{ color: c.primary }}>🔮</div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: c.text }}>{t.dashboard.title}</h1>
          <p className="mb-8 text-sm" style={{ color: c.textMuted }}>{t.dashboard.signInPrompt}</p>
          <Link href="/sign-in" className="inline-block px-8 py-3 rounded-full text-base font-semibold transition-all"
            style={{ backgroundColor: c.primary, color: currentTheme.isDark ? c.bg : "#FFFFFF" }}>
            {t.nav.signIn}
          </Link>
        </div>
      </main>
    );
  }

  const hasBirthInfo = data?.user?.birthDate;

  return (
    <main className="min-h-screen">
      <div className="relative mx-auto max-w-5xl px-4 py-8">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
            style={{ background: `radial-gradient(circle, ${c.primary}12 0%, transparent 70%)` }} />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full"
            style={{ background: `radial-gradient(circle, ${c.secondary || c.primary}08 0%, transparent 70%)` }} />
        </div>

        {/* Header */}
        <div className="relative mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: c.text }}>
                {t.dashboard.welcomeBack}{data?.user?.name ? `, ${data.user.name}` : ""} ✦
              </h1>
              <p className="text-sm mt-1" style={{ color: c.textMuted }}>
                {t.dashboard.cosmicDashboard}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: `${c.primary}12`,
                  color: c.primary,
                  border: `1px solid ${c.primary}20`,
                }}>
                {data?.user?.plan === "mystic" ? `✦ ${t.dashboard.planLabel}` : t.dashboard.freePlan} · {data?.user?.points || 0} pts
              </div>
            </div>
          </div>
        </div>

        {/* Profile completion CTA */}
        {!hasBirthInfo && (
          <div className="relative mb-6 p-4 rounded-xl text-sm"
            style={{
              backgroundColor: `${c.primary}08`,
              border: `1px solid ${c.primary}20`,
              color: c.text,
            }}>
            <span style={{ color: c.primary }}>✦</span>{" "}
            <Link href="/profile" className="font-medium underline underline-offset-2" style={{ color: c.primary }}>
              {t.dashboard.completeProfile}
            </Link>
          </div>
        )}

        {/* Main grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* BaZi Summary */}
          <div className="md:col-span-2">
            <ChartSummary birthDate={data?.user?.birthDate || null} />
          </div>
          {/* Membership Card */}
          <div>
            <MembersipCard plan={data?.user?.plan || "free"} />
          </div>
        </div>

        {/* Today's Fortune */}
        {data?.todayFortune && (
          <div className="relative mb-6 p-4 rounded-xl"
            style={{
              backgroundColor: c.surface,
              border: `1px solid ${c.primary}10`,
            }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📜</span>
              <span className="text-sm font-semibold" style={{ color: c.text }}>{t.dashboard.todayFortune}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: c.textMuted }}>{data.todayFortune}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="relative mb-6">
          <h2 className="text-sm font-semibold mb-3" style={{ color: c.textMuted }}>{t.dashboard.yourTools}</h2>
          <QuickActions />
        </div>

        {/* Recent Readings */}
        <div className="relative">
          <h2 className="text-sm font-semibold mb-3" style={{ color: c.textMuted }}>{t.dashboard.recentReadings}</h2>
          <RecentReadings readings={data?.recentReadings || []} birthDate={data?.user?.birthDate || null} />
        </div>
      </div>
    </main>
  );
}
