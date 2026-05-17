"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "@/components/theme/ThemeProvider";
import Link from "next/link";
import DailyWish from "@/components/features/DailyWish";

export default function WishClient() {
  const { isSignedIn, isLoaded } = useAuth();
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;

  if (!isLoaded) {
    return (
      <div className="text-center">
        <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="text-center">
        <p className="text-sm mb-4" style={{ color: c.textMuted }}>
          Sign in to make your daily wishes.
        </p>
        <Link
          href="/sign-in"
          className="inline-block px-8 py-3 rounded-full text-base font-semibold transition-all"
          style={{ backgroundColor: c.primary, color: currentTheme.isDark ? c.bg : "#FFFFFF" }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  return <DailyWish isSignedIn={isSignedIn} />;
}
