import AboutClient from "./AboutClient";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

const TITLES: Record<Locale, { title: string; description: string }> = {
  en: { title: "About", description: "Learn about Orient Wisdom — our mission, technology, and the team behind AI-powered spiritual guidance." },
  "zh-CN": { title: "关于我们", description: "Learn about Orient Wisdom — our mission, technology, and the team behind AI-powered spiritual guidance." },
  "zh-TW": { title: "關於我們", description: "Learn about Orient Wisdom — our mission, technology, and the team behind AI-powered spiritual guidance." },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = TITLES[locale] || TITLES.en;
  return { title: meta.title, description: meta.description };
}

export default function AboutPage() {
  return <AboutClient />;
}
