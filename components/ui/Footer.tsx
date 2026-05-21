"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer className="py-10 px-6">
      <div
        className="h-px mx-auto max-w-4xl mb-8"
        style={{
          background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-primary) 40%, transparent), transparent)",
        }}
      />

      <div className="mx-auto max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Orient Wisdom &copy; {new Date().getFullYear()} &mdash; {t.footer.rights}
        </p>

        <div className="flex items-center gap-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <a href="/about" className="hover:text-[var(--color-primary)] transition-colors">{t.footer.about}</a>
          <a href="/faq" className="hover:text-[var(--color-primary)] transition-colors">{t.footer.faq}</a>
          <a href="/privacy" className="hover:text-[var(--color-primary)] transition-colors">{t.footer.privacy}</a>
          <a href="/terms" className="hover:text-[var(--color-primary)] transition-colors">{t.footer.terms}</a>
          <a href="/changelog" className="hover:text-[var(--color-primary)] transition-colors">{t.footer.version}</a>
          <a href="mailto:support@wentchine.shop" className="hover:text-[var(--color-primary)] transition-colors">{t.footer.contact}</a>
        </div>
      </div>

      <p className="text-center text-xs mt-6" style={{ color: "var(--color-text-muted)", opacity: 0.5 }}>
        {t.footer.poweredBy}
      </p>
    </footer>
  );
}
