import { Suspense } from "react";
import SignInClient from "../SignInClient";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

const TITLES: Record<Locale, { title: string; description: string }> = {
  en: { title: "Sign In", description: "Sign in to your Orient Wisdom account." },
  "zh-CN": { title: "登录", description: "Sign in to your Orient Wisdom account." },
  "zh-TW": { title: "登入", description: "Sign in to your Orient Wisdom account." },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = TITLES[locale] || TITLES.en;
  return { title: meta.title, description: meta.description };
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInClient />
    </Suspense>
  );
}
