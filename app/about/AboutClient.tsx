"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function AboutClient() {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;

  return (
    <div className="min-h-screen px-4 py-16" style={{ backgroundColor: c.bg }}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-6" style={{ color: c.text }}>{t.about.title}</h1>

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: c.textMuted }}>
          <section className="p-6 rounded-xl" style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: c.text }}>{t.about.missionTitle}</h2>
            <p>{t.about.missionContent}</p>
          </section>

          <section className="p-6 rounded-xl" style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: c.text }}>{t.about.technologyTitle}</h2>
            <p>{t.about.technologyContent}</p>
          </section>

          <section className="p-6 rounded-xl" style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}10` }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: c.text }}>{t.about.valuesTitle}</h2>
            <ul className="space-y-2">
              <li>{t.about.accessibility}</li>
              <li>{t.about.authenticity}</li>
              <li>{t.about.empowerment}</li>
              <li>{t.about.privacy}</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
