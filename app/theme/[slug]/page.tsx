import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, ShoppingBag, BookOpen, ChevronRight, Home } from "lucide-react";
import { themes } from "@/lib/themes";
import Footer from "@/components/ui/Footer";
import { getServerTranslation } from "@/lib/i18n/server";

// 生成静态参数（六主题预渲染）
export function generateStaticParams() {
  return Object.keys(themes).map((key) => ({ slug: key }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const theme = themes[params.slug];
  if (!theme) return { title: "Not Found" };
  return {
    title: theme.name,
    description: `${theme.desc} Explore ${theme.name.toLowerCase()} readings, products, and guides.`,
    openGraph: {
      title: `${theme.name} — Orient Wisdom`,
      description: theme.desc,
    },
  };
}

export default function ThemeChannelPage({
  params,
}: {
  params: { slug: string };
}) {
  const theme = themes[params.slug];
  if (!theme) notFound();

  const t = getServerTranslation();
  const c = theme.colors;

  return (
    <main className="min-h-screen">
      {/* 顶部背景光效 */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${c.primary}18 0%, transparent 60%)`,
          }}
        />

        {/* 面包屑 */}
        <div className="relative mx-auto max-w-4xl px-6 pt-6">
          <nav
            className="flex items-center gap-2 text-sm animate-fade-in"
            style={{ color: c.textMuted }}
          >
            <Link href="/" className="flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors">
              <Home size={14} />
              {t.common.home}
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: c.primary }}>{theme.name}</span>
          </nav>
        </div>

        {/* Hero 区域 */}
        <div className="relative mx-auto max-w-4xl px-6 pt-12 pb-16 text-center">
          {/* 装饰线 */}
          <div
            className="w-12 h-px mx-auto mb-8 animate-fade-in"
            style={{ background: c.primary }}
          />

          {/* Emoji 图标 */}
          <div className="text-6xl md:text-7xl mb-6 animate-fade-in delay-100">
            {theme.emoji}
          </div>

          {/* 主题名 */}
          <h1
            className="text-4xl md:text-6xl font-bold tracking-wide animate-slide-up delay-200"
            style={{ color: c.primary }}
          >
            {theme.name}
          </h1>
          <p
            className="mt-2 text-lg tracking-widest animate-slide-up delay-300"
            style={{ color: c.textMuted, opacity: 0.7 }}
          >
            <span lang="zh">{theme.nameZh}</span>
          </p>

          {/* 描述 */}
          <p
            className="mt-6 text-base md:text-lg max-w-lg mx-auto leading-relaxed animate-slide-up delay-400"
            style={{ color: c.text }}
          >
            {theme.desc}
          </p>

          {/* 装饰线 */}
          <div
            className="w-12 h-px mx-auto mt-8 animate-fade-in delay-500"
            style={{ background: c.primary }}
          />
        </div>
      </div>

      {/* 功能卡片 */}
      <div className="mx-auto max-w-4xl px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ChannelCard
            icon={Sparkles}
            title={t.ui.aiReading}
            desc={`Get a personalized ${theme.name.toLowerCase()} reading powered by AI.`}
            href={`/tools?theme=${theme.key}`}
            c={c}
            delay={0}
            exploreText={t.ui.explore}
          />
          <ChannelCard
            icon={ShoppingBag}
            title={t.ui.products}
            desc={`Explore curated ${theme.name.toLowerCase()} products and mystical tools.`}
            href={`/shop?theme=${theme.key}`}
            c={c}
            delay={100}
            exploreText={t.ui.explore}
          />
          <ChannelCard
            icon={BookOpen}
            title={t.ui.articles}
            desc={`Deepen your knowledge with ${theme.name.toLowerCase()} guides and insights.`}
            href={`/blog?theme=${theme.key}`}
            c={c}
            delay={200}
            exploreText={t.ui.explore}
          />
        </div>

        {/* 精选内容占位网格 */}
        <div className="mt-16">
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: c.primary }}
          >
            {t.ui.featured}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden hover-lift"
                style={{
                  border: `1px solid ${c.primary}22`,
                }}
              >
                {/* 占位图 */}
                <div
                  className="h-40"
                  style={{
                    background: `linear-gradient(135deg, ${c.surface}, ${c.primary}15)`,
                  }}
                />
                <div className="p-5" style={{ backgroundColor: c.surface }}>
                  <h3 className="font-semibold mb-2" style={{ color: c.text }}>
                    {i === 1 ? t.ui.gettingStarted : t.ui.featuredCollection}
                  </h3>
                  <p className="text-sm" style={{ color: c.textMuted }}>
                    {i === 1
                      ? t.ui.beginJourney.replace("{name}", theme.name.toLowerCase())
                      : t.ui.handpickedItems.replace("{name}", theme.name.toLowerCase())}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function ChannelCard({
  icon: Icon,
  title,
  desc,
  href,
  c,
  delay,
  exploreText,
}: {
  icon: React.ComponentType<{ size?: number | string }>;
  title: string;
  desc: string;
  href: string;
  c: { primary: string; surface: string; text: string; textMuted: string };
  delay: number;
  exploreText: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl overflow-hidden hover-lift animate-slide-up"
      style={{
        opacity: 0,
        animationDelay: `${delay + 400}ms`,
        animationFillMode: "forwards",
        background: c.surface,
        border: `1px solid ${c.primary}33`,
      }}
    >
      <div className="p-6">
        {/* 图标 */}
        <div
          className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
          style={{
            backgroundColor: c.primary + "15",
            color: c.primary,
          }}
        >
          <Icon size={22} />
        </div>

        {/* 文字 */}
        <h3 className="text-lg font-semibold mb-2" style={{ color: c.primary }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed mb-4" style={{ color: c.textMuted }}>
          {desc}
        </p>

        {/* 链接 */}
        <span
          className="inline-flex items-center gap-1 text-sm font-medium"
          style={{ color: c.primary }}
        >
          {exploreText}
          <ChevronRight
            size={14}
            className="group-hover:translate-x-1 transition-transform duration-300"
          />
        </span>
      </div>
    </Link>
  );
}
