"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

export default function ThemeSwitcher() {
  const { currentTheme, setTheme, allThemes } = useTheme();

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {allThemes.map((t) => (
        <button
          key={t.key}
          onClick={() => setTheme(t.key)}
          className="px-3 py-1.5 rounded-full text-sm transition-all"
          style={{
            backgroundColor: currentTheme.key === t.key ? t.colors.primary : "transparent",
            color: currentTheme.key === t.key ? t.colors.bg : t.colors.primary,
            border: `1px solid ${t.colors.primary}66`,
          }}
        >
          {t.emoji} {t.name}
        </button>
      ))}
    </div>
  );
}
