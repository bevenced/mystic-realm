"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import Link from "next/link";

interface RecentReadingsProps {
  readings: any[];
  birthDate: string | null;
}

export default function RecentReadings({ readings, birthDate }: RecentReadingsProps) {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;

  if (!birthDate) {
    return (
      <div className="p-6 rounded-xl text-center"
        style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
        <p className="text-xs" style={{ color: c.textMuted }}>
          {t.dashboard.completeProfile}
        </p>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="p-6 rounded-xl text-center"
        style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
        <span className="text-2xl block mb-2" style={{ color: c.primary }}>🔮</span>
        <p className="text-xs mb-3" style={{ color: c.textMuted }}>{t.dashboard.noReadings}</p>
        <Link href="/tools"
          className="inline-block px-5 py-2 rounded-lg text-xs font-medium transition-all"
          style={{ backgroundColor: c.primary, color: currentTheme.isDark ? c.bg : "#FFFFFF" }}>
          {t.dashboard.getFirstReading}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
      {readings.map((r: any, i: number) => (
        <div key={r.id || i} className="flex items-center justify-between px-4 py-3 text-sm"
          style={{
            borderBottom: i < readings.length - 1 ? `1px solid ${c.primary}08` : "none",
          }}>
          <div className="flex items-center gap-3">
            <span style={{ color: c.primary }}>☯</span>
            <div>
              <span className="font-medium" style={{ color: c.text }}>{t.home.features.bazi}</span>
              <span className="text-[10px] ml-2" style={{ color: c.textMuted }}>
                {r.birth_date}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {r.day_master_strength && (
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${c.primary}12`, color: c.primary }}>
                {r.day_master_strength}
              </span>
            )}
            <span className="text-[10px]" style={{ color: c.textMuted }}>
              {new Date(r.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
