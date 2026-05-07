"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { type ThemeConfig, themes, themeList, getGoogleFontsUrl } from "@/lib/themes";

interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (key: string) => void;
  allThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: themes.meditation,
  setTheme: () => {},
  allThemes: themeList,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themes.meditation);

  const setTheme = useCallback((key: string) => {
    const theme = themes[key];
    if (!theme) return;
    document.documentElement.setAttribute("data-theme", key);
    setCurrentTheme(theme);
  }, []);

  // 预加载 Google Fonts（避免重复插入）
  useEffect(() => {
    const existing = document.querySelector('link[href*="fonts.googleapis.com"]');
    if (existing) return;
    const link = document.createElement("link");
    link.href = getGoogleFontsUrl();
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, allThemes: themeList }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
