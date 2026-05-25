"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import Link from "next/link";

const TOOLS = [
  { emoji: "🔮", key: "tarot", href: "/tools?service=tarot" },
  { emoji: "☯️", key: "bazi", href: "/tools?service=bazi" },
  { emoji: "⭐", key: "astrology", href: "/tools?service=astrology" },
  { emoji: "🏠", key: "fengshui", href: "/tools?service=fengshui" },
  { emoji: "🧘", key: "meditation", href: "/tools?service=meditation" },
  { emoji: "💞", key: "compatibility", href: "/compatibility" },
];

const COPY: Record<string, { title: string; desc: string; eyebrow: string; enter: string }> = {
  en: { title: "All Tools", desc: "Six divination arts at your fingertips — each one a doorway to deeper understanding.", eyebrow: "Skills Platform", enter: "Enter" },
  "zh-CN": { title: "全部工具", desc: "六种占卜技艺尽在指尖——每一种都是一扇通往更深理解的窗口。", eyebrow: "技能平台", enter: "进入" },
  "zh-TW": { title: "全部工具", desc: "六種占卜技藝盡在指尖——每一種都是一扇通往更深理解的窗口。", eyebrow: "技能平台", enter: "進入" },
};

export default function CantianShowcase() {
  const { locale } = useLocale();
  const t = COPY[locale] || COPY.en;

  const services: Record<string, Record<string, string>> = {
    en: { tarot: "Tarot", bazi: "BaZi", astrology: "Astrology", fengshui: "Feng Shui", meditation: "Meditation", compatibility: "Compatibility" },
    "zh-CN": { tarot: "塔罗", bazi: "八字", astrology: "占星", fengshui: "风水", meditation: "冥想", compatibility: "合盘" },
    "zh-TW": { tarot: "塔羅", bazi: "八字", astrology: "占星", fengshui: "風水", meditation: "冥想", compatibility: "合盤" },
  };
  const names = services[locale] || services.en;

  return (
    <section className="py-16 md:py-24 lg:py-28 px-4">
      <div className="mx-auto max-w-[1320px]">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-[11px] font-semibold tracking-[0.13em] uppercase mb-4" style={{ color: "#d4a85a" }}>
            {t.eyebrow}
          </p>
          <h2 className="heading-fluid-lg font-serif" style={{ color: "#e8ddd0" }}>
            {t.title}
          </h2>
          <div className="section-accent-line mx-auto" />
          <p className="text-[15px] mt-6 max-w-[65ch] mx-auto" style={{ color: "#9a8a7a" }}>
            {t.desc}
          </p>
        </div>

        {/* Showcase card — big bordered card with corner brackets */}
        <div
          className="relative p-8 md:p-12"
          style={{
            border: "1px solid #3a2a1a",
            background: "#1a1410",
            boxShadow: "0 24px 44px -30px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Corner brackets */}
          <div className="corner-bracket corner-bracket--tl" style={{ opacity: 0.7 }} />
          <div className="corner-bracket corner-bracket--br" style={{ opacity: 0.7 }} />

          {/* Tool cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOOLS.map((tool, i) => (
              <Link
                key={tool.key}
                href={tool.href}
                className="group block p-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  border: "1px solid #4a3820",
                  background: "#241a10",
                  borderRadius: 0,
                }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{tool.emoji}</span>
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: "#e8ddd0" }}>
                      {names[tool.key] || tool.key}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: "#9a8a7a" }}>
                      <span className="link-arrow text-xs">
                        {t.enter}
                        <span>&rarr;</span>
                      </span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
