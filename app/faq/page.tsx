import FaqClient from "./FaqClient";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

const TITLES: Record<Locale, { title: string; description: string }> = {
  en: { title: "FAQ", description: "Frequently asked questions about Orient Wisdom — BaZi, Tarot, Feng Shui, memberships, and more." },
  "zh-CN": { title: "常见问题", description: "Frequently asked questions about Orient Wisdom — BaZi, Tarot, Feng Shui, memberships, and more." },
  "zh-TW": { title: "常見問題", description: "Frequently asked questions about Orient Wisdom — BaZi, Tarot, Feng Shui, memberships, and more." },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = TITLES[locale] || TITLES.en;
  return { title: meta.title, description: meta.description };
}

export default function FaqPage() {
  return <FaqClient />;
}
