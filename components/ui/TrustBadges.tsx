"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { Sparkles, Users, Star, Shield } from "lucide-react";

const trustItems = [
  {
    icon: Users,
    label: "10,000+",
    sublabel: "AI Readings Completed",
  },
  {
    icon: Star,
    label: "4.8 / 5",
    sublabel: "Average User Rating",
  },
  {
    icon: Sparkles,
    label: "DeepSeek AI",
    sublabel: "Powered by Advanced AI",
  },
  {
    icon: Shield,
    label: "100% Private",
    sublabel: "Your Data is Secure",
  },
];

export default function TrustBadges() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;

  return (
    <section className="py-16 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {trustItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="relative rounded-lg p-5 text-center animate-fade-in"
                style={{
                  background: `linear-gradient(135deg, ${c.primary}08 0%, ${c.surface} 100%)`,
                  border: `1px solid ${c.primary}15`,
                  animationDelay: `${i * 100}ms`,
                }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: `${c.primary}15` }}
                >
                  <Icon size={20} style={{ color: c.primary }} />
                </div>

                {/* Number */}
                <p
                  className="text-xl md:text-2xl font-bold mb-1"
                  style={{ color: c.primary }}
                >
                  {item.label}
                </p>

                {/* Label */}
                <p
                  className="text-xs tracking-wider"
                  style={{ color: c.textMuted }}
                >
                  {item.sublabel}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
