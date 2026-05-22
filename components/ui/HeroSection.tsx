"use client";

import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import ConstellationBG from "@/components/ui/ConstellationBG";
import { Sparkles, MessageCircle, ChevronDown } from "lucide-react";

export default function HeroSection() {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Layer 0: theme gradient */}
      <div
        className="absolute inset-0 theme-transition"
        style={{ background: currentTheme.gradientHero }}
      />

      {/* Layer 1: constellation animation */}
      <ConstellationBG />

      {/* Layer 2: subtle radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, transparent 40%, ${c.bg}90 100%)`,
        }}
      />

      {/* Layer 3: Chinese watermark "易" */}
      <div
        className="absolute select-none pointer-events-none"
        style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: "clamp(10rem, 25vw, 20rem)",
          fontWeight: 400,
          color: `${c.primary}05`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          lineHeight: 1,
        }}
      >
        {String.fromCodePoint(0x6613)}
      </div>

      {/* Layer 4: main content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        {/* Top accent line + label */}
        <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in">
          <div className="w-8 h-px" style={{ background: `${c.primary}30` }} />
          <span
            className="text-[10px] tracking-[0.3em] uppercase font-medium"
            style={{ color: c.primary, opacity: 0.7 }}
          >
            AI-Powered · {t.home.title}
          </span>
          <div className="w-8 h-px" style={{ background: `${c.primary}30` }} />
        </div>

        {/* Title */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-wide animate-slide-up leading-tight"
          style={{
            color: c.primary,
            textShadow: `0 0 60px ${c.primary}15`,
          }}
        >
          {t.ui.heroTitle}
        </h1>

        {/* Subtitle */}
        <p
          className="mt-6 text-lg md:text-2xl animate-slide-up delay-150 leading-relaxed max-w-2xl mx-auto"
          style={{ color: c.textMuted }}
        >
          {t.ui.heroSubtitle}
        </p>

        {/* Dual CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-300">
          <Link
            href="/tools"
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-base font-semibold transition-all duration-300 hover:-translate-y-0.5"
            style={{
              backgroundColor: c.primary,
              color: isDark ? c.bg : "#FFFFFF",
              boxShadow: `0 4px 24px ${c.primary}30`,
            }}
          >
            <Sparkles size={18} />
            {t.ui.exploreFeatures}
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </Link>
          <Link
            href="/chat"
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-base font-semibold transition-all duration-300 hover:-translate-y-0.5"
            style={{
              backgroundColor: "transparent",
              color: c.text,
              border: `1.5px solid ${c.primary}30`,
            }}
          >
            <MessageCircle size={18} style={{ color: c.primary }} />
            {t.ui.aiReading}
          </Link>
        </div>

        {/* Trust badges inline */}
        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 animate-fade-in delay-500"
          style={{ color: c.textMuted }}
        >
          {[
            { num: "10,000+", lab: t.ui.trustReadingLabel },
            { num: "4.8", lab: t.ui.trustRatingLabel },
            { num: t.ui.trustAI, lab: t.ui.trustPrivacyLabel },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="font-bold text-sm" style={{ color: c.primary }}>{item.num}</span>
              <span className="opacity-60">{item.lab}</span>
              {i < 2 && <span className="w-px h-3 ml-2" style={{ background: `${c.textMuted}20` }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <ChevronDown size={20} style={{ color: c.primary, opacity: 0.4 }} />
      </div>
    </section>
  );
}
