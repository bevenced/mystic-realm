"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import Link from "next/link";

const tools = [
  { href: "/tools?service=tarot", emoji: "🔮", nameKey: "tools.services.tarot" },
  { href: "/tools?service=bazi", emoji: "☯", nameKey: "tools.services.bazi" },
  { href: "/tools?service=astrology", emoji: "⭐", nameKey: "tools.services.astrology" },
  { href: "/tools?service=fengshui", emoji: "🏠", nameKey: "tools.services.fengshui" },
  { href: "/tools?service=meditation", emoji: "🧘", nameKey: "tools.services.meditation" },
  { href: "/chat", emoji: "💬", nameKey: "nav.aiChat" },
  { href: "/dailyfortune", emoji: "📜", nameKey: "nav.dailyFortune" },
  { href: "/wish", emoji: "✨", nameKey: "nav.dailyWish" },
];

export default function QuickActions() {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;

  const getName = (tool: typeof tools[number]) => {
    const keys = tool.nameKey.split(".");
    let val: any = t;
    for (const k of keys) val = val[k];
    return val || tool.nameKey;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {tools.map((tool) => (
        <Link key={tool.href} href={tool.href}
          className="flex items-center gap-3 p-3 rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5"
          style={{
            backgroundColor: c.surface,
            border: `1px solid ${c.primary}10`,
            color: c.text,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = c.primary;
            e.currentTarget.style.boxShadow = `0 4px 16px ${c.primary}12`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${c.primary}10`;
            e.currentTarget.style.boxShadow = "none";
          }}>
          <span className="text-xl">{tool.emoji}</span>
          <span className="font-medium">{getName(tool)}</span>
        </Link>
      ))}
    </div>
  );
}
