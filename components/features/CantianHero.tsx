"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import CosmicMandala from "@/components/ui/CosmicMandala";
import { ArrowRight, MessageCircle } from "lucide-react";

const COPY: Record<string, Record<string, string>> = {
  en: {
    eyebrow1: "Orient Wisdom",
    headline1: "AI That Understands",
    headline2: "Eastern Mysticism",
    slogan: "Wisdom That Orients You",
    desc: "Combining BaZi, Tarot, Astrology, and Feng Shui — AI reads the patterns of destiny. Ancient wisdom, reimagined for the modern age.",
    cta: "Explore Now",
    or: "or",
    btnFortune: "Daily Fortune",
    btnChat: "AI Chat",
  },
  "zh-CN": {
    eyebrow1: "Orient Wisdom",
    headline1: "更懂你的",
    headline2: "东方玄学 AI",
    slogan: "指引你的东方智慧",
    desc: "融合八字、塔罗、占星与风水智慧，AI 为你解读命运密码。让古老智慧在现代科技中焕发新生。",
    cta: "开始探索",
    or: "或",
    btnFortune: "每日运势",
    btnChat: "AI 对话",
  },
  "zh-TW": {
    eyebrow1: "Orient Wisdom",
    headline1: "更懂你的",
    headline2: "東方玄學 AI",
    slogan: "指引你的東方智慧",
    desc: "融合八字、塔羅、占星與風水智慧，AI 為你解讀命運密碼。讓古老智慧在現代科技中煥發新生。",
    cta: "開始探索",
    or: "或",
    btnFortune: "每日運勢",
    btnChat: "AI 對話",
  },
};

export default function CantianHero() {
  const { locale } = useLocale();
  const t = COPY[locale] || COPY.en;

  return (
    <section className="relative px-4 pb-12 pt-2 md:pb-20 md:pt-14 overflow-hidden">
      <div className="mx-auto max-w-[1320px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[78vh]">
        {/* Left: Text content */}
        <div className="order-2 lg:order-1 text-center lg:text-left">
          {/* Eyebrow */}
          <span
            className="text-[11px] font-semibold tracking-[0.13em] uppercase"
            style={{ color: "#d4a85a" }}
          >
            {t.eyebrow1}
          </span>

          {/* h1 — two lines like cantian.ai */}
          <h1 className="font-serif mt-4">
            <span
              className="block text-base md:text-lg lg:text-xl font-medium tracking-normal"
              style={{ color: "#c19a4b" }}
            >
              {t.headline1}
            </span>
            <span
              className="block mt-3 heading-fluid-xl"
              style={{ color: "#e8ddd0" }}
            >
              {t.headline2}
            </span>
          </h1>

          {/* Slogan */}
          <p className="mt-5 text-sm tracking-[0.12em] font-medium" style={{ color: "#c19a4b" }}>
            {t.slogan}
          </p>

          {/* Subheading */}
          <p
            className="mt-6 text-[15px] md:text-base leading-relaxed max-w-[57ch] mx-auto lg:mx-0"
            style={{ color: "#9a8a7a" }}
          >
            {t.desc}
          </p>

          {/* Primary CTA — Gold pill */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-3 justify-center lg:justify-start">
            <Link
              href="/tools"
              className="btn-gold gap-2"
            >
              {t.cta}
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* "Or" divider */}
          <div className="divider-or my-6 max-w-xs mx-auto lg:mx-0">
            <span className="divider-or-badge">{t.or}</span>
          </div>

          {/* Secondary buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
            <Link
              href="/dailyfortune"
              className="inline-flex items-center gap-2.5 min-h-[3rem] px-6 rounded-[15px] text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
              style={{
                border: "1px solid #4a3820",
                background: "#2a1e14",
                color: "#d0c0a8",
                boxShadow: "0 14px 28px -22px rgba(0, 0, 0, 0.58)",
              }}
            >
              <span className="text-lg">🔮</span>
              {t.btnFortune}
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2.5 min-h-[3rem] px-6 rounded-[15px] text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
              style={{
                border: "1px solid #4a3820",
                background: "#2a1e14",
                color: "#d0c0a8",
                boxShadow: "0 14px 28px -22px rgba(0, 0, 0, 0.58)",
              }}
            >
              <MessageCircle size={18} />
              {t.btnChat}
            </Link>
          </div>
        </div>

        {/* Right: Cosmic Mandala illustration */}
        <div className="order-1 lg:order-2 relative flex items-center justify-center">
          <div className="relative w-full aspect-square max-w-lg mx-auto">
            <CosmicMandala />
            <div
              className="absolute inset-[15%] rounded-full pointer-events-none"
              style={{
                border: "1px solid rgba(193, 154, 75, 0.2)",
                background: "radial-gradient(circle at 50% 50%, rgba(193, 154, 75, 0.08) 0%, transparent 60%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
