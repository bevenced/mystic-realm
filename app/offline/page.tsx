"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function OfflinePage() {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: c.bg }}
    >
      <div className="text-center max-w-md">
        <div
          className="text-6xl mb-6 animate-float"
          style={{ color: c.primary }}
        >
          ☯
        </div>
        <h1
          className="text-3xl font-bold mb-4"
          style={{ color: c.text }}
        >
          {t.offline.title}
        </h1>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: c.textMuted }}
        >
          {t.offline.description}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 rounded-lg text-sm font-semibold transition-all hover-lift"
          style={{
            backgroundColor: c.primary,
            color: currentTheme.isDark ? c.bg : "#FFFFFF",
          }}
        >
          {t.offline.reconnect}
        </button>
      </div>
    </div>
  );
}
