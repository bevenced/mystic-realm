"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

export interface ServiceOption {
  key: string;
  name: string;
  emoji: string;
  desc: string;
  themeKey: string; // which theme this service primarily belongs to
  price: number;
}

export const SERVICES: ServiceOption[] = [
  {
    key: "tarot",
    name: "AI Tarot Reading",
    emoji: "🃏",
    desc: "Draw cards and receive a personalized AI-powered tarot interpretation.",
    themeKey: "tarot",
    price: 4.99,
  },
  {
    key: "bazi",
    name: "BaZi Destiny Analysis",
    emoji: "🔮",
    desc: "Discover your Four Pillars of Destiny and elemental balance from your birth data.",
    themeKey: "bazi",
    price: 7.99,
  },
  {
    key: "fengshui",
    name: "Feng Shui Consultation",
    emoji: "☯",
    desc: "Get AI-powered Feng Shui analysis of your living or workspace.",
    themeKey: "fengshui",
    price: 5.99,
  },
  {
    key: "astrology",
    name: "Natal Chart Reading",
    emoji: "✨",
    desc: "Explore your Sun, Moon, and Rising signs with a comprehensive cosmic interpretation.",
    themeKey: "astrology",
    price: 6.99,
  },
  {
    key: "meditation",
    name: "Guided Meditation",
    emoji: "🧘",
    desc: "Receive a personalized guided meditation script tailored to your current needs.",
    themeKey: "meditation",
    price: 3.99,
  },
];

interface ServiceCardProps {
  service: ServiceOption;
  isSelected: boolean;
  onSelect: (key: string) => void;
}

export default function ServiceCard({ service, isSelected, onSelect }: ServiceCardProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;

  return (
    <button
      onClick={() => onSelect(service.key)}
      className="group text-left rounded-lg overflow-hidden transition-all duration-300 animate-slide-up"
      style={{
        background: isSelected ? `${c.primary}12` : c.surface,
        border: `2px solid ${isSelected ? c.primary : `${c.primary}22`}`,
        boxShadow: isSelected ? `0 0 25px ${currentTheme.glow}` : "none",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
        opacity: 0,
        animationFillMode: "forwards",
      }}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Emoji */}
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{
              backgroundColor: `${c.primary}12`,
            }}
          >
            <span className="text-2xl">{service.emoji}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: isSelected ? c.primary : c.text }}
            >
              {service.name}
            </h3>
            <p
              className="text-xs leading-relaxed"
              style={{ color: c.textMuted }}
            >
              {service.desc}
            </p>
            <p className="text-xs mt-2 font-medium" style={{ color: c.primary }}>
              Full reading from ${service.price.toFixed(2)}
            </p>
          </div>

          {/* Selected indicator */}
          {isSelected && (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: c.primary,
                color: isDark ? c.bg : "#FFFFFF",
              }}
            >
              ✓
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
