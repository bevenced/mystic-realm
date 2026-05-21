"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import Avatar from "@/components/ui/Avatar";

const navLinks = [
  { href: "/dailyfortune", labelKey: "dailyFortune" as const },
  { href: "/wish", labelKey: "dailyWish" as const },
  { href: "/blog", labelKey: "blog" as const },
];

const authLinks = [
  { href: "/profile", labelKey: "profile" as const },
  { href: "/membership", labelKey: "membership" as const },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { isSignedIn, user, signOut } = useAuth();
  const { t } = useLocale();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2"
        style={{ color: "var(--color-text)" }}
        aria-label={t.ui.toggleMenu}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 animate-fade-in"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
              <div className="flex flex-col items-center justify-center min-h-screen gap-8">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 p-2"
                  style={{ color: "var(--color-text)" }}
                  aria-label={t.ui.closeMenu}
                >
                  <X size={24} />
                </button>

                {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-2xl font-semibold animate-slide-up theme-transition"
                  style={{ color: "var(--color-primary)" }}
                >
                  {t.nav[link.labelKey]}
                </Link>
            ))}

                <div className="mt-4 flex flex-col items-center gap-3 animate-slide-up delay-200">
                  <p
                    className="text-sm text-center"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {t.ui.switchRealm}
                  </p>
                  <ThemeSwitcher />
                  <LanguageSwitcher />
                </div>

                {isSignedIn && authLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium animate-slide-up theme-transition"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {t.nav[link.labelKey]}
                  </Link>
                ))}

                <div className="mt-8 animate-slide-up delay-300 flex flex-col items-center gap-4">
                  {isSignedIn ? (
                    <>
                      <Avatar src={user?.avatar} name={user?.name} size={64} />
                      <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                        {user?.name || user?.email}
                      </p>
                      <button
                        onClick={() => { signOut(); setOpen(false); }}
                        className="text-sm px-6 py-2 rounded-full"
                        style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border-tertiary)" }}
                      >
                        {t.userMenu.signOut}
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-3">
                      <Link href="/sign-in" onClick={() => setOpen(false)}>
                        <button className="text-sm px-6 py-2 rounded-full" style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border-tertiary)" }}>
                          {t.nav.signIn}
                        </button>
                      </Link>
                      <Link href="/sign-up" onClick={() => setOpen(false)}>
                        <button className="text-sm px-6 py-2 rounded-full" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}>
                          {t.nav.signUp}
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
