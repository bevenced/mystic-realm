"use client";

import Link from "next/link";
import MobileMenu from "@/components/ui/MobileMenu";

export default function Navbar() {
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
          className="hidden md:flex items-center gap-8 text-sm"
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

        {/* 移动端菜单按钮 */}
        <MobileMenu />
      </div>
    </nav>
  );
}
