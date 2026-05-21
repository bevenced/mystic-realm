import { Suspense } from "react";
import DailyFortuneClient from "./DailyFortuneClient";
import Footer from "@/components/ui/Footer";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getServerTranslation } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

const TITLES: Record<Locale, { title: string; description: string }> = {
  en: { title: "Daily Fortune", description: "Generate your personalized AI-powered daily fortune card based on your unique BaZi chart." },
  "zh-CN": { title: "每日运势", description: "根据你的独特八字命盘，生成个性化的 AI 每日运势卡片。" },
  "zh-TW": { title: "每日運勢", description: "根據你的獨特八字命盤，生成個人化的 AI 每日運勢卡片。" },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = TITLES[locale] || TITLES.en;
  return { title: meta.title, description: meta.description };
}

export default function DailyFortunePage() {
  const t = getServerTranslation();
  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t.common.loading}
            </div>
          </div>
        }
      >
        <DailyFortuneClient />
      </Suspense>
      <Footer />
    </>
  );
}
