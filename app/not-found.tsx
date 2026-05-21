"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import Link from "next/link";

export default function NotFound() {
  const { t } = useLocale();

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <p
          className="text-8xl font-bold mb-4"
          style={{ color: "var(--color-primary)", opacity: 0.6 }}
        >
          404
        </p>
        <h1
          className="text-2xl font-semibold mb-3"
          style={{ color: "var(--color-text)" }}
        >
          {t.notFound.title}
        </h1>
        <p
          className="text-sm mb-8 max-w-md mx-auto"
          style={{ color: "var(--color-text-muted)" }}
        >
          {t.notFound.description}
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-full text-base font-semibold transition-all"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-bg)",
          }}
        >
          {t.notFound.returnHome}
        </Link>
      </div>
    </main>
  );
}
