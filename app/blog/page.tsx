import { Suspense } from "react";
import BlogPageClient from "./BlogPageClient";
import Footer from "@/components/ui/Footer";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

const TITLES: Record<Locale, { title: string; description: string }> = {
  en: { title: "Blog", description: "Explore articles about BaZi, Tarot, Feng Shui, and spiritual wellness." },
  "zh-CN": { title: "博客", description: "Explore articles about BaZi, Tarot, Feng Shui, and spiritual wellness." },
  "zh-TW": { title: "部落格", description: "Explore articles about BaZi, Tarot, Feng Shui, and spiritual wellness." },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = TITLES[locale] || TITLES.en;
  return { title: meta.title, description: meta.description };
}

export default function BlogPage() {
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
        <BlogPageClient />
      </Suspense>
      <Footer />
    </>
  );
}
