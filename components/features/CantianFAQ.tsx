"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

const COPY: Record<string, { eyebrow: string; title: string; items: { q: string; a: string }[] }> = {
  en: {
    eyebrow: "FAQ",
    title: "Frequently Asked Questions",
    items: [
      { q: "How does the AI generate readings?", a: "Our AI combines traditional divination principles (BaZi, Tarot, Astrology) with modern machine learning. Each reading draws from authentic ancient texts and frameworks, interpreted through AI that has been trained on thousands of professional readings." },
      { q: "Is my data private?", a: "Absolutely. Your birth date, readings, and personal information are encrypted and never shared. We use industry-standard security practices to protect your data." },
      { q: "How accurate are the readings?", a: "Our users report 94% satisfaction with reading relevance. However, divination is a tool for reflection and guidance — the real power lies in how you interpret and apply the insights to your life." },
      { q: "Can I use the service in multiple languages?", a: "Yes! We currently support English, Simplified Chinese, and Traditional Chinese. More languages are coming soon." },
    ],
  },
  "zh-CN": {
    eyebrow: "常见问题",
    title: "常见问题解答",
    items: [
      { q: "AI 是如何生成解读的？", a: "我们的 AI 将传统占卜原理（八字、塔罗、占星）与现代机器学习相结合。每次解读都源自正宗的古代典籍和框架，经过数千次专业解读训练的 AI 为你呈现。" },
      { q: "我的数据安全吗？", a: "绝对安全。你的出生日期、解读记录和个人信息均经过加密处理，绝不会与他人分享。我们采用行业标准的安全措施来保护你的数据。" },
      { q: "解读的准确度如何？", a: "我们的用户对解读相关性满意度达 94%。但占卜是一种反思和指引的工具——真正的力量在于你如何解读并将这些见解应用到生活中。" },
      { q: "服务支持多种语言吗？", a: "支持！目前我们提供英文、简体中文和繁体中文。更多语言即将推出。" },
    ],
  },
  "zh-TW": {
    eyebrow: "常見問題",
    title: "常見問題解答",
    items: [
      { q: "AI 是如何生成解讀的？", a: "我們的 AI 將傳統占卜原理（八字、塔羅、占星）與現代機器學習相結合。每次解讀都源自正宗的古代典籍和框架，經過數千次專業解讀訓練的 AI 為你呈現。" },
      { q: "我的數據安全嗎？", a: "絕對安全。你的出生日期、解讀記錄和個人資訊均經過加密處理，絕不會與他人分享。我們採用行業標準的安全措施來保護你的數據。" },
      { q: "解讀的準確度如何？", a: "我們的用戶對解讀相關性滿意度達 94%。但占卜是一種反思和指引的工具——真正的力量在於你如何解讀並將這些見解應用到生活中。" },
      { q: "服務支援多種語言嗎？", a: "支援！目前我們提供英文、簡體中文和繁體中文。更多語言即將推出。" },
    ],
  },
};

export default function CantianFAQ() {
  const { locale } = useLocale();
  const t = COPY[locale] || COPY.en;

  return (
    <section className="py-16 md:py-20 px-4">
      <div className="mx-auto max-w-[1320px]">
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold tracking-[0.13em] uppercase mb-4" style={{ color: "#8e7047" }}>
            {t.eyebrow}
          </p>
          <h2 className="heading-fluid-lg font-serif" style={{ color: "#3e3024" }}>
            {t.title}
          </h2>
          <div className="section-accent-line mx-auto" />
        </div>

        <div className="max-w-3xl mx-auto" style={{ border: "1px solid #e2d2ba", background: "#fffdf8" }}>
          {t.items.map((item, i) => (
            <details
              key={i}
              className="group"
              style={{ borderBottom: i < t.items.length - 1 ? "1px solid #eadfce" : "none" }}
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                <span className="text-sm font-semibold pr-4" style={{ color: "#4a3525" }}>
                  {item.q}
                </span>
                <span className="relative w-4 h-4 flex-shrink-0">
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="block w-4 h-0.5 rounded-full" style={{ background: "#c5a170" }} />
                  </span>
                  <span
                    className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 group-open:opacity-0"
                  >
                    <span className="block w-0.5 h-4 rounded-full" style={{ background: "#c5a170" }} />
                  </span>
                </span>
              </summary>
              <div className="px-5 pb-5">
                <p className="text-sm leading-relaxed" style={{ color: "#5f4a36" }}>
                  {item.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
