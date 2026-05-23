"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { Flame, Sparkles, UserCircle } from "lucide-react";
import Link from "next/link";

const COPY: Record<string, { title: string; desc: string; items: { num: string; icon: string; title: string; desc: string; href: string }[] }> = {
  en: {
    title: "Core Features",
    desc: "Three paths to self-discovery — each powered by AI and rooted in ancient tradition.",
    items: [
      { num: "01", icon: "🔥", title: "Daily Fortune", desc: "AI-powered BaZi reading with personalized insights for your day ahead.", href: "/dailyfortune" },
      { num: "02", icon: "✨", title: "Daily Wish", desc: "Set intentions and manifest your dreams with guided daily wishes.", href: "/wish" },
      { num: "03", icon: "👤", title: "Profile & Journey", desc: "Your personal dashboard — track your fortune history and spiritual growth.", href: "/profile" },
    ],
  },
  "zh-CN": {
    title: "核心功能",
    desc: "三条自我探索之路——每条都由 AI 驱动，根植于古老传统。",
    items: [
      { num: "01", icon: "🔥", title: "每日运势", desc: "AI 驱动的八字解读，为你提供量身定制的当日指引。", href: "/dailyfortune" },
      { num: "02", icon: "✨", title: "每日许愿", desc: "设定意图，在引导下每日许愿，助你实现梦想。", href: "/wish" },
      { num: "03", icon: "👤", title: "个人档案", desc: "你的专属仪表盘——追踪运势历史与灵性成长。", href: "/profile" },
    ],
  },
  "zh-TW": {
    title: "核心功能",
    desc: "三條自我探索之路——每條都由 AI 驅動，根植於古老傳統。",
    items: [
      { num: "01", icon: "🔥", title: "每日運勢", desc: "AI 驅動的八字解讀，為你提供量身定制的當日指引。", href: "/dailyfortune" },
      { num: "02", icon: "✨", title: "每日許願", desc: "設定意圖，在引導下每日許願，助你實現夢想。", href: "/wish" },
      { num: "03", icon: "👤", title: "個人檔案", desc: "你的專屬儀表板——追蹤運勢歷史與靈性成長。", href: "/profile" },
    ],
  },
};

export default function CantianFeatures() {
  const { locale } = useLocale();
  const t = COPY[locale] || COPY.en;

  return (
    <section className="py-16 md:py-24 lg:py-28 px-4">
      <div className="mx-auto max-w-[1320px]">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-[11px] font-semibold tracking-[0.14em] mb-4" style={{ color: "#d4a85a" }}>
            {t.title.toUpperCase()}
          </p>
          <h2 className="heading-fluid-lg font-serif" style={{ color: "#e8ddd0" }}>
            {t.title}
          </h2>
          <div className="section-accent-line mx-auto" />
          <p className="text-[15px] mt-6 max-w-[65ch] mx-auto" style={{ color: "#9a8a7a" }}>
            {t.desc}
          </p>
        </div>

        {/* 3-column features with number badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-10">
          {t.items.map((item, i) => (
            <Link
              key={item.num}
              href={item.href}
              className="group block"
            >
              <div className={i === 0 ? "md:pt-16" : i === 1 ? "md:pt-8" : ""}>
                {/* Number badge */}
                <p className="feature-number mb-4">{item.num}</p>

                {/* Icon circle */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mb-4"
                  style={{ border: "1px solid #4a3820", background: "#2a1e14" }}
                >
                  <span className="text-sm">{item.icon}</span>
                </div>

                {/* Title */}
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{ color: "#e8ddd0" }}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-[15px] leading-relaxed mb-4" style={{ color: "#c0b09a" }}>
                  {item.desc}
                </p>

                {/* Arrow link */}
                <span className="link-arrow">
                  {locale === "en" ? "Learn more" : "了解更多"}
                  <span>&rarr;</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
