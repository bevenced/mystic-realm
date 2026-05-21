"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import DailyCheckin from "@/components/features/DailyCheckin";
import PointsActivity from "@/components/features/PointsActivity";
import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function DailyFortuneClient() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;
  const { isSignedIn, isLoaded } = useAuth();
  const { t } = useLocale();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {t.common.loading}
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen">
        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: c.text }}>
            {t.dailyFortune.signInPrompt}
          </h1>
          <Link
            href="/sign-in"
            className="inline-block px-8 py-3 rounded-full text-base font-semibold transition-all"
            style={{ backgroundColor: c.primary, color: isDark ? c.bg : "#FFFFFF" }}
          >
            {t.signIn.title}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="relative">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${c.primary}12 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-2xl px-6 pt-24 pb-20">
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-3xl font-bold" style={{ color: c.primary }}>
              {t.dailyFortune.title}
            </h1>
            <p className="text-sm mt-2" style={{ color: c.textMuted }}>
              {t.dailyFortune.subtitle}
            </p>
          </div>
          <DailyCheckin isSignedIn={isSignedIn} />
          <div className="mt-6">
            <PointsActivity />
          </div>
        </div>
      </div>
    </main>
  );
}
