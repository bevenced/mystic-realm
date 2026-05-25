import { Suspense } from "react";
import SignUpClient from "../SignUpClient";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

const TITLES: Record<Locale, { title: string; description: string }> = {
  en: { title: "Sign Up", description: "Create your Orient Wisdom account." },
  "zh-CN": { title: "注册", description: "Create your Orient Wisdom account." },
  "zh-TW": { title: "註冊", description: "Create your Orient Wisdom account." },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = TITLES[locale] || TITLES.en;
  return { title: meta.title, description: meta.description };
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpClient />
    </Suspense>
  );
}
