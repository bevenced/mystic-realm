"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import Link from "next/link";
import { Moon } from "lucide-react";

const COPY: Record<string, { tagline: string; knowledge: string; related: string; partners: string; copyright: string }> = {
  en: {
    tagline: "Bringing ancient wisdom to the modern world through the power of AI.",
    knowledge: "Knowledge",
    related: "Links",
    partners: "Partners",
    copyright: "Orient Wisdom. All rights reserved.",
  },
  "zh-CN": {
    tagline: "通过 AI 的力量，将古老智慧带入现代世界。",
    knowledge: "知识库",
    related: "相关链接",
    partners: "合作网站",
    copyright: "Orient Wisdom. 保留所有权利。",
  },
  "zh-TW": {
    tagline: "透過 AI 的力量，將古老智慧帶入現代世界。",
    knowledge: "知識庫",
    related: "相關連結",
    partners: "合作網站",
    copyright: "Orient Wisdom. 保留所有權利。",
  },
};

export default function CantianFooter() {
  const { locale } = useLocale();
  const t = COPY[locale] || COPY.en;

  return (
    <footer className="py-12 md:py-16 px-4">
      <div className="mx-auto max-w-[1320px]">
        {/* Multi-column footer */}
        <div className="grid grid-cols-1 md:grid-cols-[4fr_3fr_3fr_2fr] gap-8 md:gap-12">
          {/* Column 1: Logo + tagline */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <Moon size={20} style={{ color: "#c5a170" }} />
              <span className="text-sm font-semibold" style={{ color: "#4a3525" }}>Orient Wisdom</span>
            </div>
            <p className="text-sm max-w-md" style={{ color: "#665744" }}>
              {t.tagline}
            </p>
          </div>

          {/* Column 2: Knowledge */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.16em] uppercase mb-4" style={{ color: "#4a3525" }}>
              {t.knowledge}
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: locale === "en" ? "BaZi Readings" : "八字解读", href: "/dailyfortune" },
                { label: locale === "en" ? "Tarot" : "塔罗", href: "/tools?service=tarot" },
                { label: locale === "en" ? "Astrology" : "占星", href: "/tools?service=astrology" },
                { label: locale === "en" ? "Feng Shui" : "风水", href: "/tools?service=fengshui" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:opacity-80" style={{ color: "#665744" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Related Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.16em] uppercase mb-4" style={{ color: "#4a3525" }}>
              {t.related}
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: locale === "en" ? "About" : "关于", href: "/about" },
                { label: locale === "en" ? "FAQ" : "常见问题", href: "/faq" },
                { label: locale === "en" ? "Privacy" : "隐私政策", href: "/privacy" },
                { label: locale === "en" ? "Terms" : "服务条款", href: "/terms" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:opacity-80" style={{ color: "#665744" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Partners */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.16em] uppercase mb-4" style={{ color: "#4a3525" }}>
              {t.partners}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:support@wentchine.shop" className="text-sm transition-colors hover:opacity-80" style={{ color: "#665744" }}>
                  {locale === "en" ? "Contact Us" : "联系我们"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 text-center text-xs" style={{ borderTop: "1px solid #e2d2ba", color: "#9a7f5b" }}>
          &copy; {new Date().getFullYear()} {t.copyright}
        </div>
      </div>
    </footer>
  );
}
