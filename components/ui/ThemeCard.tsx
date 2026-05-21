"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { type ThemeConfig } from "@/lib/themes";

export default function ThemeCard({
  theme,
  index,
}: {
  theme: ThemeConfig;
  index: number;
}) {
  const { t } = useLocale();
  const c = theme.colors;

  return (
    <Link
      href={`/theme/${theme.key}`}
      className="group relative block rounded-2xl overflow-hidden hover-lift animate-slide-up"
      style={{
        opacity: 0,
        animationDelay: `${index * 100 + 200}ms`,
        animationFillMode: "forwards",
      }}
    >
      {/* 卡片背景 */}
      <div
        className="absolute inset-0 theme-transition"
        style={{
          background: theme.isDark
            ? `linear-gradient(135deg, ${c.surface} 0%, ${c.primary}15 100%)`
            : `linear-gradient(135deg, ${c.surface} 0%, ${c.primary}08 100%)`,
        }}
      />

      {/* 悬停光效 */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${theme.glow} 0%, transparent 70%)`,
        }}
      />

      {/* 边框 */}
      <div
        className="absolute inset-0 rounded-2xl theme-transition"
        style={{ border: `1px solid ${c.primary}33` }}
      />

      {/* 内容 */}
      <div className="relative p-8">
        {/* 图标 */}
        <div
          className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300"
          style={{ filter: "none" }}
        >
          {theme.emoji}
        </div>

        {/* 标题 */}
        <h3 className="text-xl font-bold mb-1 theme-transition" style={{ color: c.primary }}>
          {theme.name}
        </h3>
        <p className="text-sm mb-3 theme-transition" style={{ color: c.textMuted, opacity: 0.7 }}>
          <span lang="zh">{theme.nameZh}</span>
        </p>

        {/* 描述 */}
        <p className="text-sm leading-relaxed theme-transition" style={{ color: c.textMuted }}>
          {theme.desc}
        </p>

        {/* Enter 链接 */}
        <div className="mt-5 flex items-center gap-2 text-sm font-medium theme-transition"
          style={{ color: c.primary, opacity: 0.8 }}
        >
          <span className="group-hover:translate-x-1 transition-transform duration-300">
            {t.ui.enter}
          </span>
          <span className="group-hover:translate-x-2 transition-transform duration-300">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
