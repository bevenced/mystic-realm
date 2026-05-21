"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function HeroSection() {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 背景渐变 */}
      <div
        className="absolute inset-0 theme-transition"
        style={{ background: currentTheme.gradientHero }}
      />

      {/* 极淡的径向光晕（替代 GlowOrb） */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "60%",
          height: "60%",
          top: "20%",
          left: "20%",
          background: `radial-gradient(ellipse at center, ${c.primary}10 0%, transparent 60%)`,
        }}
      />

      {/* 背景中文水印装饰 */}
      <div
        className="absolute select-none pointer-events-none"
        style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: "clamp(12rem, 30vw, 24rem)",
          fontWeight: 400,
          color: `${c.primary}06`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          letterSpacing: "0.1em",
          lineHeight: 1,
        }}
      >
        易
      </div>

      {/* 主内容 */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        {/* 顶部装饰线 */}
        <div
          className="w-12 h-px mx-auto mb-8 animate-fade-in"
          style={{ background: `linear-gradient(90deg, transparent, ${c.primary}, transparent)` }}
        />

        <h1
          className="text-5xl md:text-7xl font-bold tracking-wider animate-slide-up"
          style={{ color: c.primary }}
        >
          {t.ui.heroTitle}
        </h1>

        <p
          className="mt-5 text-xl md:text-2xl animate-slide-up delay-200 leading-relaxed"
          style={{ color: c.textMuted }}
        >
          {t.ui.heroSubtitle}
        </p>

        {/* CTA 按钮 — 无脉冲呼吸灯 */}
        <div className="mt-12 animate-slide-up delay-400">
          <a
            href="#features"
            className="inline-block px-8 py-3 rounded-lg text-base font-semibold theme-transition hover-lift"
            style={{
              color: currentTheme.isDark ? c.bg : "#FFFFFF",
              backgroundColor: c.primary,
              border: `1px solid ${c.primary}40`,
            }}
          >
            {t.ui.exploreFeatures}
          </a>
        </div>

        {/* 底部装饰线 + 菱形点缀 */}
        <div className="flex items-center justify-center gap-2 mt-12 animate-fade-in delay-500">
          <div className="w-16 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c.primary}30)` }} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ background: `${c.primary}40` }} />
          <div className="w-16 h-px" style={{ background: `linear-gradient(90deg, ${c.primary}30, transparent)` }} />
        </div>
      </div>
    </section>
  );
}
