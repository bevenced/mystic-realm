"use client";

import { useSearchParams } from "next/navigation";
import { getBlogThemes, getPostsByTheme } from "@/lib/blog-posts";
import BlogCard from "@/components/features/BlogCard";
import Link from "next/link";
import { BookOpen, Home, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function BlogPageClient() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const searchParams = useSearchParams();
  const themeFilter = searchParams.get("theme") || "all";

  const posts = getPostsByTheme(themeFilter);
  const blogThemes = getBlogThemes();

  const isDark = currentTheme.isDark;
  const activeTextColor = isDark ? c.bg : "#FFFFFF";

  return (
    <main className="min-h-screen">
      <div className="relative">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${c.primary}08 0%, transparent 60%)`,
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-20">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 text-sm mb-8 animate-fade-in"
            style={{ color: c.textMuted }}
          >
            <Link href="/" className="flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors">
              <Home size={14} />
              Home
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: c.primary }}>Blog</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="w-12 h-px mx-auto mb-6" style={{ background: c.primary }} />
            <div className="flex items-center justify-center gap-3 mb-3">
              <BookOpen size={24} style={{ color: c.primary }} />
              <h1
                className="text-3xl md:text-4xl font-bold tracking-wider"
                style={{ color: c.primary }}
              >
                Mystical Blog
              </h1>
            </div>
            <p className="text-sm" style={{ color: c.textMuted }}>
              Deepen your knowledge with guides, insights, and wisdom from across the mystical arts.
            </p>
          </div>

          {/* Theme filter tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 animate-slide-up">
            <Link
              href="/blog"
              className="px-4 py-1.5 rounded-full text-sm transition-all"
              style={{
                backgroundColor: themeFilter === "all" ? c.primary : "transparent",
                color: themeFilter === "all" ? activeTextColor : c.textMuted,
                border: `1px solid ${c.primary}33`,
              }}
            >
              All
            </Link>
            {blogThemes.map((t) => (
              <Link
                key={t.key}
                href={`/blog?theme=${t.key}`}
                className="px-4 py-1.5 rounded-full text-sm transition-all"
                style={{
                  backgroundColor: themeFilter === t.key ? c.primary : "transparent",
                  color: themeFilter === t.key ? activeTextColor : c.textMuted,
                  border: `1px solid ${c.primary}33`,
                }}
              >
                {t.emoji} {t.label}
              </Link>
            ))}
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <div
                key={post.slug}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <BlogCard
                  slug={post.slug}
                  title={post.title}
                  excerpt={post.excerpt}
                  theme={post.theme}
                  themeLabel={post.themeLabel}
                  date={post.date}
                  readTime={post.readTime}
                  emoji={post.emoji}
                  tags={post.tags}
                />
              </div>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg" style={{ color: c.textMuted }}>
                No articles found for this category yet.
              </p>
              <Link
                href="/blog"
                className="inline-block mt-4 text-sm font-medium"
                style={{ color: c.primary }}
              >
                ← View all articles
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
