import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Navbar from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: "Mystic Realm — Meditation · Healing · Divination",
  description:
    "Explore meditation, healing, feng shui, BaZi, tarot, and astrology. Spiritual guidance and mystical products for your journey.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="meditation">
      <body className="antialiased">
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
