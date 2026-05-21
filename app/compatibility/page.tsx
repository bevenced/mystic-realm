import CompatibilityClient from "./CompatibilityClient";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

const TITLES: Record<Locale, { title: string; description: string }> = {
  en: { title: "BaZi Compatibility", description: "Compare two BaZi charts for relationship compatibility analysis. Discover how the Five Elements and Four Pillars interact between two people." },
  "zh-CN": { title: "八字合盘", description: "Compare two BaZi charts for relationship compatibility analysis. Discover how the Five Elements and Four Pillars interact between two people." },
  "zh-TW": { title: "八字合盤", description: "Compare two BaZi charts for relationship compatibility analysis. Discover how the Five Elements and Four Pillars interact between two people." },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = TITLES[locale] || TITLES.en;
  return { title: meta.title, description: meta.description };
}

export default function CompatibilityPage() {
  return <CompatibilityClient />;
}
