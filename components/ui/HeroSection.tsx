"use client";

import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import ConstellationBG from "@/components/ui/ConstellationBG";
import AuraParticles from "@/components/ui/AuraParticles";
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

      {/* Layer 2: aura particles */}
      <AuraParticles />

      {/* Layer 3: main content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        {/* Top accent line + label */}
        <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in">
          <div className="w-8 h-px" style={{ background: `${c.primary}30` }} />
          <span
            className="text-[9px] tracking-[0.25em] uppercase font-medium"
            style={{ color: c.primary, opacity: 0.5 }}
          >
            AI-Powered · {t.home.title}
          </span>
          <div className="w-8 h-px" style={{ background: `${c.primary}30` }} />
        </div>

        {/* Title — fluid, with negative letter-spacing */}
        <h1
          className="heading-fluid-xl"
          style={{
            color: c.primary,
            textShadow: `0 0 60px ${c.primary}15`,
          }}
        >
          {t.ui.heroTitle}
        </h1>

        {/* Subtitle — fluid base */}
        <p
          className="heading-fluid-base mt-6 animate-slide-up delay-150 max-w-2xl mx-auto"
          style={{ color: c.textMuted }}
        >
          {t.ui.heroSubtitle}
        </p>

        {/* Tagline — refined second line */}
        {t.home.tagline && (
          <p
            className="text-sm mt-3 animate-slide-up delay-200 max-w-xl mx-auto"
            style={{ color: c.textMuted, opacity: 0.6 }}
          >
            {t.home.tagline}
          </p>
        )}

        {/* Dual CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-300">
          <Link
            href="/tools"
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-btn"
            style={{
              backgroundColor: c.primary,
              color: isDark ? c.bg : "#FFFFFF",
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
              border: `1.5px solid ${c.primary}25`,
            }}
          >
            <MessageCircle size={18} style={{ color: c.primary }} />
            {t.ui.aiReading}
          </Link>
        </div>

        {/* Trust badges inline */}
        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 animate-fade-in delay-500"
          style={{ color: c.textMuted }}
        >
          {[
            { num: "10,000+", lab: t.ui.trustReadingLabel },
            { num: "4.8", lab: t.ui.trustRatingLabel },
            { num: t.ui.trustAI, lab: t.ui.trustPrivacyLabel },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
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
