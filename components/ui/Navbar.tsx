"use client";

import Link from "next/link";
import MobileMenu from "@/components/ui/MobileMenu";
import StreakBadge from "@/components/features/StreakBadge";
import { useAuth } from "@/components/auth/AuthProvider";
import UserMenu from "@/components/ui/UserMenu";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const { t } = useLocale();

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-bg) 80%, transparent)",
        borderBottom: "1px solid color-mix(in srgb, var(--color-primary) 8%, transparent)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-wider theme-transition"
          style={{ color: "var(--color-primary)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
          <span>{t.home.title}</span>
        </Link>

        {/* Desktop nav links */}
        <div
          className="hidden md:flex items-center gap-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          <Link href="/dashboard" className="nav-link theme-transition hover:text-[var(--color-primary)]">
            {t.nav.dashboard}
          </Link>
          <Link href="/dailyfortune" className="nav-link theme-transition hover:text-[var(--color-primary)]">
            {t.nav.dailyFortune}
          </Link>
          <Link href="/chat" className="nav-link theme-transition hover:text-[var(--color-primary)]">
            {t.nav.aiChat}
          </Link>
          <Link href="/wish" className="nav-link theme-transition hover:text-[var(--color-primary)]">
            {t.nav.dailyWish}
          </Link>
          <Link href="/blog" className="nav-link theme-transition hover:text-[var(--color-primary)]">
            {t.nav.blog}
          </Link>
        </div>

        {/* User menu */}
        <div className="hidden md:flex items-center gap-3 ml-6">
          <LanguageSwitcher />
          {isSignedIn && (
            <>
              <StreakBadge isSignedIn={isSignedIn} />
              <Link
                href="/profile"
                className="text-sm nav-link theme-transition hover:text-[var(--color-primary)]"
                style={{ color: "var(--color-text-muted)" }}
              >
                {t.nav.profile}
              </Link>
            </>
          )}
          {!isSignedIn && (
            <>
              <Link href="/sign-in">
                <button className="px-5 py-2.5 rounded-full theme-transition" style={{ color: "var(--color-text-muted)", border: "1px solid color-mix(in srgb, var(--color-text-muted) 20%, transparent)" }}>
                  {t.nav.signIn}
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="px-5 py-2.5 rounded-full ml-2 theme-transition" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)", border: "none" }}>
                  {t.nav.signUp}
                </button>
              </Link>
            </>
          )}
          {isSignedIn && <UserMenu />}
        </div>

        {/* Mobile menu button */}
        <MobileMenu />
      </div>
    </nav>
  );
}
