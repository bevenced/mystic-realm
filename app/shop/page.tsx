import { Suspense } from "react";
import ShopPageClient from "./ShopPageClient";
import Footer from "@/components/ui/Footer";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

const TITLES: Record<Locale, { title: string; description: string }> = {
  en: { title: "Shop", description: "Browse mystical products and spiritual tools at Orient Wisdom." },
  "zh-CN": { title: "商城", description: "Browse mystical products and spiritual tools at Orient Wisdom." },
  "zh-TW": { title: "商城", description: "Browse mystical products and spiritual tools at Orient Wisdom." },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = TITLES[locale] || TITLES.en;
  return { title: meta.title, description: meta.description };
}

export default function ShopPage() {
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
        <ShopPageClient />
      </Suspense>
      <Footer />
    </>
  );
}
