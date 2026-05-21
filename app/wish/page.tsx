import { Sparkles } from "lucide-react";
import WishClient from "./WishClient";
import WishFeed from "@/components/features/WishFeed";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

const TITLES: Record<Locale, { title: string; description: string }> = {
  en: { title: "Daily Wish", description: "Make a wish, light a star, and share your heartfelt blessings with loved ones." },
  "zh-CN": { title: "每日许愿", description: "Make a wish, light a star, and share your heartfelt blessings with loved ones." },
  "zh-TW": { title: "每日許願", description: "Make a wish, light a star, and share your heartfelt blessings with loved ones." },
};

const UI_TEXT: Record<Locale, { h1: string; desc: string }> = {
  en: { h1: "Daily Wish", desc: "Light a star for your heart's desire — 3 wishes per day, 3 points each" },
  "zh-CN": { h1: "每日许愿", desc: "为你的心愿点亮一颗星 — 每天 3 个愿望，每个 3 积分" },
  "zh-TW": { h1: "每日許願", desc: "為你的心願點亮一颗星 — 每天 3 個願望，每個 3 積分" },
};

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const meta = TITLES[locale] || TITLES.en;
  return { title: meta.title, description: meta.description };
}

export default function WishPage() {
  const cookieStore = cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || DEFAULT_LOCALE;
  const uiText = UI_TEXT[locale] || UI_TEXT.en;
  return (
    <main className="min-h-screen">
      <div className="relative">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, var(--color-primary) 0%, transparent 50%)",
            opacity: 0.08,
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-20">
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>
              <Sparkles size={28} className="inline mr-2" />
              {uiText.h1}
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
              {uiText.desc}
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <WishClient />
              <div className="mt-8 lg:hidden">
                <WishFeed />
              </div>
            </div>
            <div className="hidden lg:block">
              <WishFeed />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
