import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Navbar from "@/components/ui/Navbar";
import JsonLd from "@/components/ui/JsonLd";
import PwaInstallPrompt from "@/components/ui/PwaInstallPrompt";
import { getGoogleFontsUrl } from "@/lib/themes";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F0E8" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A20" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mystic-realm.wentchine.shop"),
  title: {
    default: "Orient Wisdom — Meditation · Healing · Divination",
    template: "%s — Orient Wisdom",
  },
  description:
    "Explore meditation, healing, feng shui, BaZi, tarot, and astrology. AI-powered spiritual guidance and mystical products for your journey.",
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
    title: "Orient Wisdom",
  },
  openGraph: {
    title: "Orient Wisdom — Meditation · Healing · Divination",
    description:
      "AI-powered tarot, BaZi, feng shui, astrology & meditation guidance.",
    url: "https://mystic-realm.wentchine.shop",
    siteName: "Orient Wisdom",
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orient Wisdom",
    description: "AI-powered mystical guidance for your spiritual journey.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="meditation">
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
          <ThemeProvider>
            <AuthProvider>
              <Navbar />
              {children}
            </AuthProvider>
            <JsonLd />
            <PwaInstallPrompt />
          </ThemeProvider>
        </body>
      </html>
  );
}
