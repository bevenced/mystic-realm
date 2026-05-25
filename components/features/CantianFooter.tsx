"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import Link from "next/link";
import { Moon } from "lucide-react";

const COPY: Record<string, {
  tagline: string;
  knowledge: string;
  related: string;
  partners: string;
  copyright: string;
  linkBaziReadings: string;
  linkTarot: string;
  linkAstrology: string;
  linkFengShui: string;
  linkAbout: string;
  linkFAQ: string;
  linkPrivacy: string;
  linkTerms: string;
  linkContactUs: string;
}> = {
  en: {
    tagline: "Bringing ancient wisdom to the modern world through the power of AI.",
    knowledge: "Knowledge",
    related: "Links",
    partners: "Partners",
    copyright: "Orient Wisdom. All rights reserved.",
    linkBaziReadings: "BaZi Readings",
    linkTarot: "Tarot",
    linkAstrology: "Astrology",
    linkFengShui: "Feng Shui",
    linkAbout: "About",
    linkFAQ: "FAQ",
    linkPrivacy: "Privacy",
    linkTerms: "Terms",
    linkContactUs: "Contact Us",
  },
  "zh-CN": {
    tagline: "通过 AI 的力量，将古老智慧带入现代世界。",
    knowledge: "知识库",
    related: "相关链接",
    partners: "合作网站",
    copyright: "Orient Wisdom. 保留所有权利。",
    linkBaziReadings: "八字解读",
    linkTarot: "塔罗",
    linkAstrology: "占星",
    linkFengShui: "风水",
    linkAbout: "关于",
    linkFAQ: "常见问题",
    linkPrivacy: "隐私政策",
    linkTerms: "服务条款",
    linkContactUs: "联系我们",
  },
  "zh-TW": {
    tagline: "透過 AI 的力量，將古老智慧帶入現代世界。",
    knowledge: "知識庫",
    related: "相關連結",
    partners: "合作網站",
    copyright: "Orient Wisdom. 保留所有權利。",
    linkBaziReadings: "八字解讀",
    linkTarot: "塔羅",
    linkAstrology: "占星",
    linkFengShui: "風水",
    linkAbout: "關於",
    linkFAQ: "常見問題",
    linkPrivacy: "隱私政策",
    linkTerms: "服務條款",
    linkContactUs: "聯絡我們",
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
              <Moon size={20} style={{ color: "#c19a4b" }} />
              <span className="text-sm font-semibold" style={{ color: "#e8ddd0" }}>Orient Wisdom</span>
            </div>
            <p className="text-sm max-w-md" style={{ color: "#9a8a7a" }}>
              {t.tagline}
            </p>
          </div>

          {/* Column 2: Knowledge */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.16em] uppercase mb-4" style={{ color: "#c19a4b" }}>
              {t.knowledge}
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: t.linkBaziReadings, href: "/dailyfortune" },
                { label: t.linkTarot, href: "/tools?service=tarot" },
                { label: t.linkAstrology, href: "/tools?service=astrology" },
                { label: t.linkFengShui, href: "/tools?service=fengshui" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:opacity-80" style={{ color: "#9a8a7a" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Related Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.16em] uppercase mb-4" style={{ color: "#c19a4b" }}>
              {t.related}
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: t.linkAbout, href: "/about" },
                { label: t.linkFAQ, href: "/faq" },
                { label: t.linkPrivacy, href: "/privacy" },
                { label: t.linkTerms, href: "/terms" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:opacity-80" style={{ color: "#9a8a7a" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Partners */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.16em] uppercase mb-4" style={{ color: "#c19a4b" }}>
              {t.partners}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:support@wentchine.shop" className="text-sm transition-colors hover:opacity-80" style={{ color: "#9a8a7a" }}>
                  {t.linkContactUs}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 text-center text-xs" style={{ borderTop: "1px solid #3a2a1a", color: "#6a5a4a" }}>
          &copy; {new Date().getFullYear()} {t.copyright}
        </div>
      </div>
    </footer>
  );
}
