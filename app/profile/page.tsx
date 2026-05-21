import { Suspense } from "react";
import ProfileClient from "./ProfileClient";
import Footer from "@/components/ui/Footer";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
export const dynamic = "force-dynamic";

const TITLES: Record<Locale, { title: string; description: string }> = {
  en: { title: "Profile", description: "Set your birth information for personalized daily fortunes and readings." },
  "zh-CN": { title: "个人中心", description: "Set your birth information for personalized daily fortunes and readings." },
  "zh-TW": { title: "個人中心", description: "Set your birth information for personalized daily fortunes and readings." },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = TITLES[locale] || TITLES.en;
  return { title: meta.title, description: meta.description };
}

export default function ProfilePage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading...</div>
          </div>
        }
      >
        <ProfileClient />
      </Suspense>
      <Footer />
    </>
  );
}
