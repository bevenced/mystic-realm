"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

export default function OfflinePage() {
  const { currentTheme } = useTheme();
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
          You Are Offline
        </h1>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: c.textMuted }}
        >
          The cosmic connection has been temporarily interrupted.
          Please check your network connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 rounded-lg text-sm font-semibold transition-all hover-lift"
          style={{
            backgroundColor: c.primary,
            color: currentTheme.isDark ? c.bg : "#FFFFFF",
          }}
        >
          Reconnect
        </button>
      </div>
    </div>
  );
}
