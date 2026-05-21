import { Suspense } from "react";
import ToolsPageClient from "./ToolsPageClient";
import Footer from "@/components/ui/Footer";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

const TITLES: Record<Locale, { title: string; description: string }> = {
  en: { title: "Mystical Tools", description: "Get personalized AI-powered tarot readings, BaZi analysis, Feng Shui consultations, natal chart readings, and guided meditations." },
  "zh-CN": { title: "灵性工具", description: "Get personalized AI-powered tarot readings, BaZi analysis, Feng Shui consultations, natal chart readings, and guided meditations." },
  "zh-TW": { title: "靈性工具", description: "Get personalized AI-powered tarot readings, BaZi analysis, Feng Shui consultations, natal chart readings, and guided meditations." },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = TITLES[locale] || TITLES.en;
  return { title: meta.title, description: meta.description };
}

export default function ToolsPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Loading...
            </div>
          </div>
        }
      >
        <ToolsPageClient />
      </Suspense>
      <Footer />
    </>
  );
}
