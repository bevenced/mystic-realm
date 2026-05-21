"use client";

import { useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { ChevronDown } from "lucide-react";

export default function FaqClient() {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const FAQS = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 },
    { q: t.faq.q6, a: t.faq.a6 },
    { q: t.faq.q7, a: t.faq.a7 },
    { q: t.faq.q8, a: t.faq.a8 },
  ];

  return (
    <div className="min-h-screen px-4 py-16" style={{ backgroundColor: c.bg }}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: c.text }}>{t.faq.title}</h1>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-xl overflow-hidden" style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-medium text-sm" style={{ color: c.text }}>{faq.q}</span>
                <ChevronDown size={18} style={{ color: c.textMuted, transform: openIndex === i ? "rotate(180deg)" : "", transition: "transform 0.2s" }} />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm leading-relaxed" style={{ color: c.textMuted }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
