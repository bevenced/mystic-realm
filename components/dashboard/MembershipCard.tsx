"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import Link from "next/link";

interface MembershipCardProps {
  plan: string;
}

export default function MembersipCard({ plan }: MembershipCardProps) {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;
  const isMystic = plan === "mystic";

  return (
    <div className="h-full p-5 rounded-xl flex flex-col"
      style={{
        backgroundColor: isMystic ? `${c.primary}12` : c.surface,
        border: `1px solid ${isMystic ? c.primary : `${c.primary}10`}`,
      }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{isMystic ? "✦" : "○"}</span>
        <span className="text-sm font-semibold" style={{ color: c.text }}>
          {isMystic ? t.dashboard.planLabel : t.dashboard.freePlan}
        </span>
      </div>

      <div className="text-xs space-y-1.5 mb-4" style={{ color: c.textMuted }}>
        {isMystic ? (
          <>
            <div className="flex items-center gap-2"><span style={{ color: c.primary }}>✓</span> {t.membership.features.unlimitedReadings}</div>
            <div className="flex items-center gap-2"><span style={{ color: c.primary }}>✓</span> {t.membership.features.fullInterpretations}</div>
            <div className="flex items-center gap-2"><span style={{ color: c.primary }}>✓</span> {t.membership.features.readingHistory} &amp; {t.membership.features.exportPdf}</div>
            <div className="flex items-center gap-2"><span style={{ color: c.primary }}>✓</span> {t.membership.features.prioritySupport}</div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2"><span style={{ color: c.primary }}>✓</span> {t.membership.features.freePreviews}</div>
            <div className="flex items-center gap-2"><span style={{ color: c.primary }}>✓</span> {t.dailyFortune.todayFortune}</div>
            <div className="flex items-center gap-2 opacity-40"><span>✗</span> {t.membership.features.unlimitedReadings}</div>
            <div className="flex items-center gap-2 opacity-40"><span>✗</span> {t.membership.features.exportPdf}</div>
          </>
        )}
      </div>

      {!isMystic && (
        <Link href="/membership"
          className="mt-auto text-center px-4 py-2 rounded-lg text-xs font-medium transition-all"
          style={{ backgroundColor: c.primary, color: currentTheme.isDark ? c.bg : "#FFFFFF" }}>
          {t.dashboard.upgradeToMystic}
        </Link>
      )}
    </div>
  );
}
