"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import GlowOrb from "@/components/ui/GlowOrb";

export default function HeroSection() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 背景渐变 */}
      <div
        className="absolute inset-0 theme-transition"
        style={{ background: currentTheme.gradientHero }}
      />

      {/* 浮动光效球 */}
      <GlowOrb size={300} color={c.primary + "33"} top="10%" left="5%" delay={0} />
      <GlowOrb size={200} color={c.accent + "28"} top="60%" left="75%" delay={2} />
      <GlowOrb size={250} color={c.secondary + "20"} top="30%" left="60%" delay={4} />

      {/* 缓慢旋转的装饰圆环 */}
      <div
        className="absolute animate-rotate-slow pointer-events-none"
        style={{
          width: 400,
          height: 400,
          top: "15%",
          right: "-5%",
          border: `1px solid ${c.primary}15`,
          borderRadius: "50%",
          opacity: 0.4,
        }}
      />

      {/* 主内容 */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        {/* 装饰线 */}
        <div
          className="w-16 h-px mx-auto mb-8 animate-fade-in"
          style={{ background: c.primary }}
        />

        <h1
          className="text-5xl md:text-7xl font-bold tracking-wider animate-slide-up"
          style={{ color: c.primary }}
        >
          Mystic Realm
        </h1>

        <p
          className="mt-4 text-xl md:text-2xl animate-slide-up delay-200"
          style={{ color: c.textMuted }}
        >
          Ancient wisdom, modern magic.
        </p>

        <p
          className="mt-2 text-sm md:text-base tracking-widest animate-slide-up delay-300"
          style={{ color: c.textMuted, opacity: 0.6 }}
        >
          六界古老智慧，为你开启
        </p>

        {/* CTA 按钮 */}
        <div className="mt-10 animate-slide-up delay-400">
          <a
            href="#realms"
            className="inline-block px-8 py-3 rounded-full text-base font-semibold animate-pulse-glow theme-transition"
            style={{
              color: currentTheme.isDark ? c.bg : "#FFFFFF",
              backgroundColor: c.primary,
            }}
          >
            Begin Your Journey
          </a>
        </div>

        {/* 装饰线 */}
        <div
          className="w-16 h-px mx-auto mt-8 animate-fade-in delay-500"
          style={{ background: c.primary }}
        />
      </div>
    </section>
  );
}
