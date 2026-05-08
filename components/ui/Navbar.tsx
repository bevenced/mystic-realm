"use client";

import Link from "next/link";
import MobileMenu from "@/components/ui/MobileMenu";
import { useUser, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: "var(--color-bg)cc",
        borderBottom: "1px solid var(--color-primary)15",
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
          <span>Mystic Realm</span>
        </Link>

        {/* 桌面端导航链接 */}
        <div
          className="hidden md:flex items-center gap-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          <Link href="/shop" className="nav-link theme-transition hover:text-[var(--color-primary)]">
            Shop
          </Link>
          <Link href="/tools" className="nav-link theme-transition hover:text-[var(--color-primary)]">
            AI Tools
          </Link>
          <Link href="/blog" className="nav-link theme-transition hover:text-[var(--color-primary)]">
            Blog
          </Link>
        </div>

        {/* 用户菜单 */}
        <div className="hidden md:flex items-center ml-6">
          {!isSignedIn && (
            <>
              <SignInButton mode="modal">
                <button className="px-5 py-2.5 rounded-full theme-transition" style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border-tertiary)" }}>
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-5 py-2.5 rounded-full ml-2 theme-transition" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg)", border: "none" }}>
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
          {isSignedIn && <UserButton />}
        </div>

        {/* 移动端菜单按钮 */}
        <MobileMenu />
      </div>
    </nav>
  );
}
