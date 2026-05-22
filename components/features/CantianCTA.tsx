"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const COPY: Record<string, { title: string; desc: string; cta: string }> = {
  en: { title: "Ready to Explore Your Path?", desc: "Start your journey with a free daily fortune reading — no account needed.", cta: "Get Your Free Reading" },
  "zh-CN": { title: "准备好探索你的命运了吗？", desc: "免费获取每日运势解读，无需注册即可开始。", cta: "免费获取解读" },
  "zh-TW": { title: "準備好探索你的命運了嗎？", desc: "免費獲取每日運勢解讀，無需註冊即可開始。", cta: "免費獲取解讀" },
};

export default function CantianCTA() {
  const { locale } = useLocale();
  const t = COPY[locale] || COPY.en;

  return (
    <section className="py-14 md:py-16 px-4" style={{ background: "#ffffff" }}>
      <div className="mx-auto max-w-[1320px] border-y border-[#e2d2ba] py-14 text-center">
        <h2 className="heading-fluid-lg font-serif" style={{ color: "#3e3024" }}>
          {t.title}
        </h2>
        <p className="text-[15px] mt-4 max-w-[57ch] mx-auto" style={{ color: "#665744" }}>
          {t.desc}
        </p>
        <div className="mt-8">
          <Link href="/dailyfortune" className="btn-gold gap-2">
            {t.cta}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
