import DashboardClient from "./DashboardClient";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

const TITLES: Record<Locale, { title: string; description: string }> = {
  en: { title: "Dashboard | Orient Wisdom", description: "Your personal destiny dashboard" },
  "zh-CN": { title: "仪表盘 | Orient Wisdom", description: "Your personal destiny dashboard" },
  "zh-TW": { title: "儀表盤 | Orient Wisdom", description: "Your personal destiny dashboard" },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = TITLES[locale] || TITLES.en;
  return { title: meta.title, description: meta.description };
}

export default function DashboardPage() {
  return <DashboardClient />;
}
