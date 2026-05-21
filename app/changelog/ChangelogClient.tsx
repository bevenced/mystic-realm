"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";

const RELEASES = [
  { version: "1.5.0", date: "2026-05-20" },
  { version: "1.4.0", date: "2026-05-15" },
  { version: "1.3.0", date: "2026-05-10" },
  { version: "1.2.0", date: "2026-05-01" },
  { version: "1.1.0", date: "2026-04-15" },
  { version: "1.0.0", date: "2026-04-01" },
];

export default function ChangelogClient() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const { t } = useLocale();

  return (
    <div className="min-h-screen px-4 py-16" style={{ backgroundColor: c.bg }}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-2" style={{ color: c.text }}>{t.changelog.title}</h1>
        <p className="text-sm mb-10" style={{ color: c.textMuted }}>{t.changelog.subtitle}</p>

        <div className="space-y-8">
          {RELEASES.map((release, i) => (
            <div key={i} className="relative pl-8" style={{ borderLeft: `2px solid ${c.primary}15` }}>
              <div className="absolute -left-2 top-0 w-4 h-4 rounded-full" style={{ backgroundColor: c.primary }} />
              <div className="mb-1">
                <span className="text-sm font-bold" style={{ color: c.text }}>v{release.version}</span>
                <span className="text-xs ml-3" style={{ color: c.textMuted }}>{release.date}</span>
              </div>
              <p className="text-sm mt-2" style={{ color: c.textMuted }}>
                {t.changelog.versions[release.version]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
