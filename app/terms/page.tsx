"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function TermsPage() {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;

  const sectionKeys = ["acceptance", "services", "payments", "accounts", "liability", "contact"] as const;

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <h1
          className="text-3xl font-bold mb-8"
          style={{ color: c.primary }}
        >
          {t.terms.title}
        </h1>
        <div className="prose-mystic space-y-4">
          <p>
            <strong>Last Updated:</strong> {t.terms.lastUpdated}
          </p>
          {sectionKeys.map((key) => {
            const section = t.terms.sections[key];
            return (
              <div key={key}>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
