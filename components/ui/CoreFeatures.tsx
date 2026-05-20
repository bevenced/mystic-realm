"use client";

import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Flame, Sparkles, UserCircle } from "lucide-react";

const features = [
  {
    icon: Flame,
    title: "Daily Fortune",
    desc: "AI-powered BaZi fortune card every day. Check in to reveal life aspect ratings, lucky colors, and personalized advice.",
    href: "/dailyfortune",
  },
  {
    icon: Sparkles,
    title: "Daily Wish",
    desc: "Make up to 3 wishes per day across five categories — health, wealth, luck, friendship, love. Send blessings via email.",
    href: "/wish",
  },
  {
    icon: UserCircle,
    title: "Your Profile",
    desc: "Set your birth date and hour to unlock your BaZi chart. Powers personalized daily fortunes and cosmic insights.",
    href: "/profile",
  },
];

export default function CoreFeatures() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;

  return (
    <section id="features" className="py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <p
            className="text-sm tracking-widest uppercase mb-3"
            style={{ color: "var(--color-text-muted)" }}
          >
            Core Features
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            What You Can Do Here
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, index) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.href}
                href={f.href}
                className="group relative block rounded-lg overflow-hidden hover-lift animate-slide-up"
                style={{
                  opacity: 0,
                  animationDelay: `${index * 100 + 200}ms`,
                  animationFillMode: "forwards",
                }}
              >
                {/* Background */}
                <div
                  className="absolute inset-0 theme-transition"
                  style={{
                    background: currentTheme.isDark
                      ? `linear-gradient(135deg, ${c.surface} 0%, ${c.primary}15 100%)`
                      : `linear-gradient(135deg, ${c.surface} 0%, ${c.primary}08 100%)`,
                  }}
                />

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${currentTheme.glow} 0%, transparent 70%)`,
                  }}
                />

                {/* Border */}
                <div
                  className="absolute inset-0 rounded-lg theme-transition"
                  style={{ border: `1px solid ${c.primary}33` }}
                />

                {/* Content */}
                <div className="relative p-8">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                    style={{ background: `${c.primary}15` }}
                  >
                    <Icon size={24} style={{ color: c.primary }} />
                  </div>

                  <h3 className="text-lg font-bold mb-2" style={{ color: c.text }}>
                    {f.title}
                  </h3>

                  <p className="text-sm leading-relaxed mb-5" style={{ color: c.textMuted }}>
                    {f.desc}
                  </p>

                  <div
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: c.primary, opacity: 0.8 }}
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      Explore
                    </span>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      →
                    </span>
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
