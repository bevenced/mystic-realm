"use client";

import Link from "next/link";
import { Home, ChevronRight, Clock, ArrowLeft } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { BlogPost } from "@/lib/blog-posts";
import SafeHtml from "@/components/features/SafeHtml";

interface Props {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogDetailClient({ post, relatedPosts }: Props) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;

  return (
    <main className="min-h-screen">
      <div className="relative">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${c.primary}08 0%, transparent 60%)`,
          }}
        />

        <div className="relative mx-auto max-w-3xl px-6 pt-24 pb-20">
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
            <Link href="/blog" className="hover:text-[var(--color-primary)] transition-colors">
              Blog
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: c.primary }} className="truncate max-w-[200px]">
              {post.themeLabel}
            </span>
          </nav>

          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm mb-8 animate-fade-in transition-colors"
            style={{ color: c.textMuted }}
          >
            <ArrowLeft size={14} />
            Back to Blog
          </Link>

          {/* Article header */}
          <header className="mb-10 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{post.emoji}</span>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${c.primary}12`,
                  color: c.primary,
                }}
              >
                {post.themeLabel}
              </span>
            </div>

            <h1
              className="text-2xl md:text-4xl font-bold leading-tight mb-4"
              style={{ color: c.text }}
            >
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm" style={{ color: c.textMuted }}>
              <span>{post.date}</span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {post.readTime}
              </span>
            </div>

            <div
              className="h-px mt-8"
              style={{ background: `linear-gradient(90deg, ${c.primary}44, transparent)` }}
            />
          </header>

          {/* Article content */}
          <article
            className="prose-mystic animate-fade-in"
            style={{ color: c.text }}
          >
            <SafeHtml html={post.content} />
          </article>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-10 animate-fade-in">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  border: `1px solid ${c.primary}33`,
                  color: c.textMuted,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 animate-fade-in">
              <div
                className="h-px mb-10"
                style={{ background: `linear-gradient(90deg, transparent, ${c.primary}44, transparent)` }}
              />

              <h2 className="text-xl font-semibold mb-6" style={{ color: c.primary }}>
                Related Articles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedPosts.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="group block rounded-xl p-4 transition-all hover:scale-[1.02]"
                    style={{
                      background: c.surface,
                      border: `1px solid ${c.primary}15`,
                    }}
                  >
                    <span className="text-2xl">{rel.emoji}</span>
                    <h3
                      className="text-sm font-semibold mt-2 mb-1 group-hover:text-[var(--color-primary)] transition-colors"
                      style={{ color: c.text }}
                    >
                      {rel.title}
                    </h3>
                    <p className="text-xs" style={{ color: c.textMuted }}>
                      {rel.readTime}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
