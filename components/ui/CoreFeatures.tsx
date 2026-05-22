"use client";

import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { Flame, Sparkles, UserCircle } from "lucide-react";

const BADGES = [
  { textKey: "featureDailyFortune", emoji: "🔥" },
  { textKey: "featureDailyWish", emoji: "✨" },
  { textKey: "featureProfile", emoji: "👤" },
];

export default function CoreFeatures() {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;

  const features = [
    {
      icon: Flame,
      title: t.ui.featureDailyFortune,
      desc: t.ui.featureDailyFortuneDesc,
      href: "/dailyfortune",
      accent: "#FF6B35",
    },
    {
      icon: Sparkles,
      title: t.ui.featureDailyWish,
      desc: t.ui.featureDailyWishDesc,
      href: "/wish",
      accent: "#FFD700",
    },
    {
      icon: UserCircle,
      title: t.ui.featureProfile,
      desc: t.ui.featureProfileDesc,
      href: "/profile",
      accent: c.primary,
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3 font-medium"
            style={{ color: c.primary, opacity: 0.7 }}
          >
            {t.ui.coreFeatures}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: c.text }}>
            {t.ui.whatYouCanDo}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, index) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.href}
                href={f.href}
                className="group relative block rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
                style={{ opacity: 0, animationDelay: `${index * 120 + 200}ms`, animationFillMode: "forwards" }}
              >
                {/* Card surface */}
                <div
                  className="absolute inset-0 theme-transition"
                  style={{
                    background: currentTheme.isDark
                      ? `linear-gradient(160deg, ${c.surface} 0%, ${c.primary}10 100%)`
                      : `linear-gradient(160deg, ${c.surface} 0%, ${c.primary}06 100%)`,
                  }}
                />

                {/* Hover glow from accent */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 60% 20%, ${f.accent}12 0%, transparent 60%)` }}
                />

                {/* Border */}
                <div
                  className="absolute inset-0 rounded-xl theme-transition group-hover:border-[1.5px]"
                  style={{ border: `1px solid ${c.primary}15` }}
                />

                {/* Content */}
                <div className="relative p-8">
                  {/* Icon with colored background */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                    style={{ background: `${f.accent}15` }}
                  >
                    <Icon size={26} style={{ color: f.accent }} />
                  </div>

                  <h3 className="text-lg font-bold mb-2" style={{ color: c.text }}>
                    {f.title}
                  </h3>

                  <p className="text-sm leading-relaxed mb-6" style={{ color: c.textMuted }}>
                    {f.desc}
                  </p>

                  {/* CTA arrow */}
                  <div
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: f.accent }}
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {t.ui.explore}
                    </span>
                    <span className="group-hover:translate-x-2 transition-transform duration-200">&rarr;</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
