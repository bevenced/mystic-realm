"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { LOCALES } from "@/lib/i18n/config";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
        style={{ color: c.textMuted, border: `1px solid ${c.primary}12` }}
        aria-label={t.ui.switchLanguage}
      >
        <Globe size={14} />
        <span>{current.nativeName}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 py-1 rounded-lg shadow-xl z-50 min-w-[140px]"
          style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm transition-all"
              style={{
                color: locale === l.code ? c.primary : c.text,
                backgroundColor: locale === l.code ? `${c.primary}10` : "transparent",
              }}
            >
              {l.nativeName}
              <span className="ml-1.5 text-xs" style={{ color: c.textMuted }}>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
