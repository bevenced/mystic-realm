import type { Metadata } from "next";
import { cookies } from "next/headers";
import CantianHero from "@/components/features/CantianHero";
import CantianAbout from "@/components/features/CantianAbout";
import CantianFeatures from "@/components/features/CantianFeatures";
import CantianShowcase from "@/components/features/CantianShowcase";
import CantianTestimonials from "@/components/features/CantianTestimonials";
import CantianFAQ from "@/components/features/CantianFAQ";
import CantianCTA from "@/components/features/CantianCTA";
import CantianFooter from "@/components/features/CantianFooter";
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
    <main data-layout="cantian">
      <CantianHero />
      <div className="section-alt"><CantianAbout /></div>
      <div className="section-alt"><CantianFeatures /></div>
      <div className="section-alt"><CantianShowcase /></div>
      <CantianTestimonials />
      <div className="section-alt"><CantianFAQ /></div>
      <CantianCTA />
      <CantianFooter />
    </main>
  );
}
