import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Navbar from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: "Mystic Realm — Meditation · Healing · Divination",
  description:
    "Explore meditation, healing, feng shui, BaZi, tarot, and astrology. Spiritual guidance and mystical products for your journey.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mystic Realm",
  },
  openGraph: {
    title: "Mystic Realm — Meditation · Healing · Divination",
    description:
      "AI-powered tarot, BaZi, feng shui, astrology & meditation guidance.",
    type: "website",
    siteName: "Mystic Realm",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mystic Realm",
    description: "AI-powered mystical guidance for your spiritual journey.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="meditation">
        <body className="antialiased">
          <ThemeProvider>
            <Navbar />
            {children}
            <Analytics />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
