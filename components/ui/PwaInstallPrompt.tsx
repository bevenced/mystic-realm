"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { X } from "lucide-react";

export default function PwaInstallPrompt() {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShow(false);
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as any).prompt();
    const result = await (deferredPrompt as any).userChoice;
    if (result.outcome === "accepted") {
      setShow(false);
      setDeferredPrompt(null);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-lg shadow-lg animate-slide-up flex items-center gap-4"
      style={{
        backgroundColor: c.surface,
        border: `1px solid ${c.primary}22`,
        boxShadow: `0 8px 32px ${c.primary}20`,
        maxWidth: 420,
      }}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: c.text }}>
          {t.pwa.title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
          {t.pwa.description}
        </p>
      </div>
      <button
        onClick={handleInstall}
        className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
        style={{
          backgroundColor: c.primary,
          color: currentTheme.isDark ? c.bg : "#FFFFFF",
        }}
      >
        {t.pwa.install}
      </button>
      <button
        onClick={() => setShow(false)}
        className="p-1 rounded-full"
        style={{ color: c.textMuted }}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
