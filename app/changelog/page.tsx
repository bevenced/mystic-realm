import ChangelogClient from "./ChangelogClient";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

const TITLES: Record<Locale, { title: string; description: string }> = {
  en: { title: "Changelog", description: "Release history and updates for Orient Wisdom." },
  "zh-CN": { title: "更新日志", description: "Release history and updates for Orient Wisdom." },
  "zh-TW": { title: "更新日誌", description: "Release history and updates for Orient Wisdom." },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = TITLES[locale] || TITLES.en;
  return { title: meta.title, description: meta.description };
}

export default function ChangelogPage() {
  return <ChangelogClient />;
}
