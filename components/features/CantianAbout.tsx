"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import SectionHeader from "@/components/ui/SectionHeader";
import Link from "next/link";

const COPY: Record<string, { title: string; desc: string; link: string }> = {
  en: {
    title: "Who We Are",
    desc: "We believe ancient wisdom holds the keys to modern clarity. Orient Wisdom blends AI with BaZi, Tarot, Astrology, and Feng Shui — making divination and self-discovery accessible to everyone, anywhere.",
    link: "Learn more about us",
  },
  "zh-CN": {
    title: "我们是谁",
    desc: "我们相信古老智慧中蕴含着解开现代困惑的钥匙。Orient Wisdom 将 AI 与八字、塔罗、占星、风水相结合——让占卜和自我探索变得人人可及。",
    link: "了解更多",
  },
  "zh-TW": {
    title: "我們是誰",
    desc: "我們相信古老智慧中蘊含著解開現代困惑的鑰匙。Orient Wisdom 將 AI 與八字、塔羅、占星、風水相結合——讓占卜和自我探索變得人人可及。",
    link: "了解更多",
  },
};

export default function CantianAbout() {
  const { locale } = useLocale();
  const t = COPY[locale] || COPY.en;

  return (
    <section className="py-16 md:py-20 px-4">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeader
          eyebrow="ORIENT WISDOM"
          title={t.title}
          description={t.desc}
        />
        <div className="text-center">
          <Link href="/about" className="link-arrow">
            {t.link}
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
