"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import type { Locale, Dictionary } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { dictionary as enDict } from "@/lib/i18n/dictionaries/en";
import { dictionary as zhCNDict } from "@/lib/i18n/dictionaries/zh-CN";
import { dictionary as zhTWDict } from "@/lib/i18n/dictionaries/zh-TW";

const DICTIONARIES: Record<Locale, Dictionary> = {
  en: enDict,
  "zh-CN": zhCNDict,
  "zh-TW": zhTWDict,
};

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
  tf: (path: string, params?: Record<string, string | number>) => string;
}

function resolvePath(obj: unknown, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => {
    const val = params[key];
    return val != null ? String(val) : `{${key}}`;
  });
}

const LocaleContext = createContext<LocaleContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: enDict,
  tf: (path) => {
    const val = resolvePath(enDict, path);
    return typeof val === "string" ? val : path;
  },
});

export function LocaleProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || DEFAULT_LOCALE);
  const dictRef = useRef(enDict);

  dictRef.current = DICTIONARIES[locale] || enDict;

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
  }, []);

  const t = DICTIONARIES[locale] || enDict;

  const tf = useCallback((path: string, params?: Record<string, string | number>) => {
    const val = resolvePath(dictRef.current, path);
    const text = typeof val === "string" ? val : path;
    return interpolate(text, params);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, tf }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
