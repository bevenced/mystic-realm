"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useEffect, useState } from "react";

interface ChartSummaryProps {
  birthDate: string | null;
}

export default function ChartSummary({ birthDate }: ChartSummaryProps) {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;
  const [bazi, setBazi] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!birthDate) return;
    try {
      const parts = birthDate.split("-");
      // Just get the pillars, no API call needed
      const { calculateBaZi } = require("@/lib/bazi-engine/pillars");
      const now = new Date();
      const result = calculateBaZi(
        parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]), 12
      );
      setBazi(result);
    } catch {
      setError(true);
    }
  }, [birthDate]);

  if (!birthDate) {
    return (
      <div className="h-full p-5 rounded-xl flex flex-col items-center justify-center text-center"
        style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
        <span className="text-3xl mb-3" style={{ color: c.primary }}>☯</span>
        <p className="text-xs" style={{ color: c.textMuted }}>{t.dashboard.noBirthInfo}</p>
      </div>
    );
  }

  if (!bazi || error) {
    return (
      <div className="h-full p-5 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
        <div className="text-xs animate-pulse" style={{ color: c.textMuted }}>{t.dashboard.calculatingChart}</div>
      </div>
    );
  }

  const pillars = [
    { name: t.dashboard.year, pillar: bazi.year },
    { name: t.dashboard.month, pillar: bazi.month },
    { name: t.dashboard.day, pillar: bazi.day },
    { name: t.dashboard.hour, pillar: bazi.hour },
  ];

  return (
    <div className="h-full p-5 rounded-xl"
      style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">☯</span>
        <span className="text-sm font-semibold" style={{ color: c.text }}>{t.dashboard.yourBaziChart}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${c.primary}12`, color: c.primary }}>
          {bazi.dayMasterYinYang} {bazi.dayMasterElement}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {pillars.map((p) => (
          <div key={p.name} className="text-center p-2 rounded-lg"
            style={{ backgroundColor: `${c.primary}06` }}>
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: c.textMuted }}>
              {p.name}
            </div>
            <div className="text-base font-bold" style={{ color: c.primary }}>
              {p.pillar.stem}{p.pillar.branch}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: c.textMuted }}>
              {p.pillar.stemElement}
            </div>
          </div>
        ))}
      </div>

      {/* Mini element bar */}
      <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
        {(["Wood","Fire","Earth","Metal","Water"] as const).map((el) => {
          const count = bazi.elementCounts[el] || 0;
          const pct = Math.max(8, count * 12.5);
          const colors: Record<string, string> = { Wood: "#4CAF50", Fire: "#FF5722", Earth: "#FFC107", Metal: "#9E9E9E", Water: "#2196F3" };
          return count > 0 ? <div key={el} style={{ width: `${pct}%`, backgroundColor: colors[el], opacity: 0.7 }} title={`${el}: ${count}`} /> : null;
        })}
      </div>
    </div>
  );
}
