import { Suspense } from "react";
import MembershipClient from "./MembershipClient";
import Footer from "@/components/ui/Footer";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

const TITLES: Record<Locale, { title: string; description: string }> = {
  en: { title: "Membership", description: "Unlock unlimited AI mystical readings for $9.99/month. Get full tarot, BaZi, astrology, feng shui, and meditation readings." },
  "zh-CN": { title: "会员", description: "Unlock unlimited AI mystical readings for $9.99/month. Get full tarot, BaZi, astrology, feng shui, and meditation readings." },
  "zh-TW": { title: "會員", description: "Unlock unlimited AI mystical readings for $9.99/month. Get full tarot, BaZi, astrology, feng shui, and meditation readings." },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = TITLES[locale] || TITLES.en;
  return { title: meta.title, description: meta.description };
}

export default function MembershipPage() {
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
        <MembershipClient />
      </Suspense>
      <Footer />
    </>
  );
}
