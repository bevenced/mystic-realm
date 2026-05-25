"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

const COPY: Record<string, { eyebrow: string; title: string; desc: string; items: { name: string; text: string; role: string }[] }> = {
  en: {
    eyebrow: "Testimonials",
    title: "What Our Users Say",
    desc: "Join thousands of users who have discovered clarity through ancient wisdom.",
    items: [
      { name: "Sarah L.", text: "The daily BaZi readings have become my morning ritual. It's uncanny how accurate the insights are.", role: "Daily User" },
      { name: "James K.", text: "I was skeptical about AI divination, but the tarot readings are surprisingly profound. Highly recommended.", role: "Premium Member" },
      { name: "Mei W.", text: "The compatibility analysis helped me understand my relationship dynamics in a whole new way. Truly eye-opening.", role: "3-month Member" },
    ],
  },
  "zh-CN": {
    eyebrow: "用户评价",
    title: "听听他们怎么说",
    desc: "加入数千名用户的队伍，通过古老智慧找到清晰方向。",
    items: [
      { name: "张小明", text: "每日八字解读已经成为我的晨间仪式。这些见解的准确度令人惊叹。", role: "每日用户" },
      { name: "李华", text: "一开始我对 AI 占卜持怀疑态度，但塔罗解读出乎意料地深刻。强烈推荐。", role: "高级会员" },
      { name: "王美", text: "合盘分析让我以一种全新的方式理解了我的关系动态。真的令人大开眼界。", role: "3个月会员" },
    ],
  },
  "zh-TW": {
    eyebrow: "用戶評價",
    title: "聽聽他們怎麼說",
    desc: "加入數千名用戶的隊伍，通過古老智慧找到清晰方向。",
    items: [
      { name: "張小明", text: "每日八字解讀已經成為我的晨間儀式。這些見解的準確度令人驚嘆。", role: "每日用戶" },
      { name: "李華", text: "一開始我對 AI 占卜持懷疑態度，但塔羅解讀出乎意料地深刻。強烈推薦。", role: "高級會員" },
      { name: "王美", text: "合盤分析讓我以一種全新的方式理解了我的關係動態。真的令人大開眼界。", role: "3個月會員" },
    ],
  },
};

export default function CantianTestimonials() {
  const { locale } = useLocale();
  const t = COPY[locale] || COPY.en;

  return (
    <section className="py-16 md:py-20 px-4">
      <div className="mx-auto max-w-[1320px]">
        <div className="text-center mb-12">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.items.map((item, i) => (
            <div
              key={i}
              className="p-5"
              style={{ border: "1px solid #3a2a1a", background: "#1a1410" }}
            >
              {/* Star rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, s) => (
                  <span key={s} style={{ color: "#c19a4b" }}>★</span>
                ))}
              </div>
              {/* Quote */}
              <p className="text-[15px] leading-relaxed mb-4" style={{ color: "#d0c0a8" }}>
                &ldquo;{item.text}&rdquo;
              </p>
              {/* Author */}
              <p className="text-sm font-semibold" style={{ color: "#e8ddd0" }}>
                {item.name}
              </p>
              <p className="text-xs" style={{ color: "#7a6a5a" }}>
                {item.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
