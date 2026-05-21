import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import Navbar from "@/components/ui/Navbar";
import Starfield from "@/components/ui/Starfield";
import JsonLd from "@/components/ui/JsonLd";
import PwaInstallPrompt from "@/components/ui/PwaInstallPrompt";
import { getGoogleFontsUrl } from "@/lib/themes";
import { getLocaleFromBrowser, type Locale } from "@/lib/i18n/config";
import { dictionary as enDict } from "@/lib/i18n/dictionaries/en";
import { dictionary as zhCNDict } from "@/lib/i18n/dictionaries/zh-CN";
import { dictionary as zhTWDict } from "@/lib/i18n/dictionaries/zh-TW";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F0E8" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A20" },
  ],
};

const DICTIONARIES: Record<Locale, typeof enDict> = {
  en: enDict,
  "zh-CN": zhCNDict,
  "zh-TW": zhTWDict,
};

const LOCALE_METADATA: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Orient Wisdom — AI-Powered Spiritual Guidance & Mystical Tools",
    description:
      "Explore meditation, healing, feng shui, BaZi, tarot, and astrology. AI-powered spiritual guidance and mystical products for your journey.",
  },
  "zh-CN": {
    title: "东方智慧 — AI 驱动的灵性指导与神秘学工具",
    description:
      "探索冥想、疗愈、风水、八字、塔罗和占星。AI 驱动的灵性指导和神秘学产品，陪伴你的旅程。",
  },
  "zh-TW": {
    title: "東方智慧 — AI 驅動的靈性指導與神秘學工具",
    description:
      "探索冥想、療癒、風水、八字、塔羅和占星。AI 驅動的靈性指導和神秘學產品，陪伴你的旅程。",
  },
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
  const meta = LOCALE_METADATA[locale] || LOCALE_METADATA.en;

  return {
    metadataBase: new URL("https://mystic-realm.wentchine.shop"),
    title: {
      default: meta.title,
      template: locale === "zh-CN" ? "%s — 东方智慧" : locale === "zh-TW" ? "%s — 東方智慧" : "%s — Orient Wisdom",
    },
    description: meta.description,
    keywords: [
      "tarot reading", "BaZi", "feng shui", "astrology", "meditation",
      "AI tarot", "spiritual guidance", "mystical", "four pillars",
      "natal chart", "crystals", "healing",
    ],
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: locale === "zh-CN" ? "东方智慧" : locale === "zh-TW" ? "東方智慧" : "Orient Wisdom",
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: "https://mystic-realm.wentchine.shop",
      siteName: locale === "zh-CN" ? "东方智慧" : locale === "zh-TW" ? "東方智慧" : "Orient Wisdom",
      type: "website",
      locale: locale === "zh-CN" ? "zh_CN" : locale === "zh-TW" ? "zh_TW" : "en_US",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: locale === "zh-CN" ? "东方智慧" : locale === "zh-TW" ? "東方智慧" : "Orient Wisdom",
      description: meta.description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const localePref = cookieStore.get("locale")?.value as Locale | undefined;
  const locale: Locale = localePref || "en";

  return (
    <html lang={locale} data-theme="meditation">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preload" as="style" href={getGoogleFontsUrl()} />
          <link rel="stylesheet" href={getGoogleFontsUrl()} />
          <noscript>
            <link rel="stylesheet" href={getGoogleFontsUrl()} />
          </noscript>
        </head>
        <body className="antialiased">
          <Starfield />
          <ThemeProvider>
            <AuthProvider>
              <LocaleProvider initialLocale={locale}>
                <Navbar />
                {children}
              </LocaleProvider>
            </AuthProvider>
            <JsonLd />
            <PwaInstallPrompt />
          </ThemeProvider>
        </body>
      </html>
  );
}
