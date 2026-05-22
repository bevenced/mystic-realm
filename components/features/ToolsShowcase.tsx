"use client";

import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";

const TOOLS = [
  { emoji: "🔮", key: "tarot", href: "/tools?service=tarot" },
  { emoji: "☯️", key: "bazi", href: "/tools?service=bazi" },
  { emoji: "⭐", key: "astrology", href: "/tools?service=astrology" },
  { emoji: "🏠", key: "fengshui", href: "/tools?service=fengshui" },
  { emoji: "🧘", key: "meditation", href: "/tools?service=meditation" },
  { emoji: "💞", key: "compatibility", href: "/compatibility" },
];

export default function ToolsShowcase() {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;

  const services = t.tools.services as Record<string, string>;
  const serviceDescs = t.tools.serviceDescs as Record<string, string>;

  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3 font-medium"
            style={{ color: c.primary, opacity: 0.7 }}
          >
            {t.ui.explore}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: c.text }}>
            {t.tools.title}
          </h2>
          <p className="text-sm mt-3 max-w-xl mx-auto" style={{ color: c.textMuted }}>
            {t.tools.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOOLS.map((tool, i) => (
            <Link
              key={tool.key}
              href={tool.href}
              className="group relative rounded-xl overflow-hidden animate-slide-up transition-all duration-300 hover:-translate-y-1"
              style={{
                opacity: 0,
                animationDelay: `${i * 80 + 100}ms`,
                animationFillMode: "forwards",
                background: currentTheme.isDark
                  ? `linear-gradient(135deg, ${c.surface} 0%, ${c.primary}12 100%)`
                  : `linear-gradient(135deg, ${c.surface} 0%, ${c.primary}06 100%)`,
                border: `1px solid ${c.primary}18`,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${c.primary}15 0%, transparent 60%)`,
                }}
              />

              <div className="relative p-7">
                {/* Emoji */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `${c.primary}10` }}
                >
                  {tool.emoji}
                </div>

                {/* Name */}
                <h3 className="text-base font-bold mb-1.5" style={{ color: c.text }}>
                  {services[tool.key] || tool.key}
                </h3>

                {/* Description */}
                <p className="text-xs leading-relaxed mb-4" style={{ color: c.textMuted, opacity: 0.8 }}>
                  {serviceDescs[tool.key] || ""}
                </p>

                {/* CTA */}
                <div
                  className="flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: c.primary }}
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    {t.ui.enter}
                  </span>
                  <span className="group-hover:translate-x-2 transition-transform duration-200">&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
