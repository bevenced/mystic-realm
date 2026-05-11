import type { Metadata } from "next";
import HeroSection from "@/components/ui/HeroSection";
import HomeCheckinWidget from "@/components/features/HomeCheckinWidget";
import TrustBadges from "@/components/ui/TrustBadges";
import ThemeCard from "@/components/ui/ThemeCard";
import FeatureSection from "@/components/ui/FeatureSection";
import Footer from "@/components/ui/Footer";
import { themeList } from "@/lib/themes";

export const metadata: Metadata = {
  title: "Ancient Wisdom, Modern Magic",
  description:
    "Explore six mystical realms: meditation, healing, feng shui, BaZi divination, tarot, and astrology. AI-powered readings, curated products, and guided wisdom.",
};

export default function HomePage() {
  return (
    <main>
      {/* Section 1: 沉浸式首屏 */}
      <HeroSection />

      {/* Daily Check-in Widget (signed-in users only) */}
      <section className="py-8 px-6">
        <div className="mx-auto max-w-md">
          <HomeCheckinWidget />
        </div>
      </section>

      {/* Section 2: 信任徽章 */}
      <TrustBadges />

      {/* Section 2: 选择你的领域 */}
      <section id="realms" className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          {/* 标题 */}
          <div className="text-center mb-14">
            <p
              className="text-sm tracking-widest uppercase mb-3"
              style={{ color: "var(--color-text-muted)" }}
            >
              Choose Your Realm
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: "var(--color-primary)" }}
            >
              Six Paths of Wisdom
            </h2>
            <p
              className="mt-3 text-sm max-w-md mx-auto"
              style={{ color: "var(--color-text-muted)" }}
            >
              Each realm holds unique secrets. Select the path that calls to your soul.
            </p>
          </div>

          {/* 六主题卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {themeList.map((theme, i) => (
              <ThemeCard key={theme.key} theme={theme} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: 特色介绍 */}
      <FeatureSection />

      {/* Section 4: 页脚 */}
      <Footer />
    </main>
  );
}
