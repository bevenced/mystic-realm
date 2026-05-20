"use client";

import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeProvider";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  theme: string;
  themeLabel: string;
  date: string;
  readTime: string;
  emoji: string;
  tags: string[];
}

export default function BlogCard({
  slug,
  title,
  excerpt,
  themeLabel,
  date,
  readTime,
  emoji,
  tags,
}: BlogCardProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block rounded-lg overflow-hidden hover-lift animate-slide-up"
      style={{
        background: c.surface,
        border: `1px solid ${c.primary}22`,
        opacity: 0,
        animationFillMode: "forwards",
      }}
    >
      {/* Emoji header */}
      <div
        className="h-36 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${c.primary}08, ${c.primary}18)`,
        }}
      >
        <span className="text-5xl group-hover:scale-110 transition-transform duration-500">
          {emoji}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Theme tag + date */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs px-2.5 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${c.primary}12`,
              color: c.primary,
            }}
          >
            {themeLabel}
          </span>
          <span className="text-xs" style={{ color: c.textMuted }}>
            {date}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-base font-semibold mb-2 leading-snug group-hover:text-[var(--color-primary)] transition-colors"
          style={{ color: c.text }}
        >
          {title}
        </h3>

        {/* Excerpt */}
        <p
          className="text-base leading-relaxed mb-3"
          style={{
            color: c.textMuted,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: c.textMuted }}>
            {readTime}
          </span>
          <span
            className="text-xs font-medium transition-colors"
            style={{ color: c.primary }}
          >
            Read more →
          </span>
        </div>
      </div>
    </Link>
  );
}
