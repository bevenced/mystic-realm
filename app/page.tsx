import type { Metadata } from "next";
import { cookies } from "next/headers";
import HeroSection from "@/components/ui/HeroSection";
import CoreFeatures from "@/components/ui/CoreFeatures";
import HomepageSocialProof from "@/components/features/HomepageSocialProof";
import Footer from "@/components/ui/Footer";
import { getLocaleFromBrowser, type Locale } from "@/lib/i18n/config";
import { dictionary as enDict } from "@/lib/i18n/dictionaries/en";
import { dictionary as zhCNDict } from "@/lib/i18n/dictionaries/zh-CN";
import { dictionary as zhTWDict } from "@/lib/i18n/dictionaries/zh-TW";

const DICTIONARIES: Record<Locale, typeof enDict> = {
  en: enDict,
  "zh-CN": zhCNDict,
  "zh-TW": zhTWDict,
};

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const localePref = cookieStore.get("locale")?.value as Locale | undefined;
  let locale: Locale;
  if (localePref) {
    locale = localePref;
  } else {
    const { headers } = await import("next/headers");
    const acceptLanguage = headers().get("accept-language") || undefined;
    locale = getLocaleFromBrowser(acceptLanguage);
  }
  const dict = DICTIONARIES[locale] || DICTIONARIES.en;
  return {
    title: dict.home.metaTitle,
    description: dict.home.metaDescription,
  };
}

export default function HomePage() {
  return (
    <main>
      {/* Section 1: Hero */}
      <HeroSection />

      {/* Section 2: Core Features */}
      <CoreFeatures />

      {/* Section 3: Community Social Proof */}
      <HomepageSocialProof />

      {/* Section 4: Footer */}
      <Footer />
    </main>
  );
}
