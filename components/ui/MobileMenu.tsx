"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import { useUser, SignInButton, SignUpButton, UserButton, SignOutButton } from "@clerk/nextjs";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/tools", label: "AI Tools" },
  { href: "/membership", label: "Membership" },
  { href: "/blog", label: "Blog" },
];

const authLinks = [
  { href: "/dashboard", label: "Dashboard" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useUser();

  return (
    <div className="md:hidden">
      {/* 汉堡按钮 */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2"
        style={{ color: "var(--color-text)" }}
        aria-label="Toggle menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* 全屏遮罩 */}
      {open && (
        <div
          className="fixed inset-0 z-40 animate-fade-in"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <div className="flex flex-col items-center justify-center min-h-screen gap-8">
            {/* 关闭按钮 */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2"
              style={{ color: "var(--color-text)" }}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>

            {/* 导航链接 */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-2xl font-semibold animate-slide-up theme-transition"
                style={{ color: "var(--color-primary)" }}
              >
                {link.label}
              </Link>
            ))}

            {/* 主题切换 */}
            <div className="mt-4 animate-slide-up delay-200">
              <p
                className="text-sm text-center mb-3"
                style={{ color: "var(--color-text-muted)" }}
              >
                Switch Realm
              </p>
              <ThemeSwitcher />
            </div>

            {/* Auth-only links */}
            {isSignedIn && authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-lg font-medium animate-slide-up theme-transition"
                style={{ color: "var(--color-text-muted)" }}
              >
                {link.label}
              </Link>
            ))}

            {/* 用户菜单 */}
            <div className="mt-8 animate-slide-up delay-300 flex flex-col items-center gap-4">
              {isSignedIn ? (
                <>
                  <UserButton />
                  <SignOutButton>
                    <button
                      className="text-sm px-6 py-2 rounded-full"
                      style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border-tertiary)" }}
                    >
                      Sign Out
                    </button>
                  </SignOutButton>
                </>
              ) : (
                <div className="flex gap-3">
                  <SignInButton mode="modal">
                    <button className="text-sm px-6 py-2 rounded-full" style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border-tertiary)" }}>
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="text-sm px-6 py-2 rounded-full" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)" }}>
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
