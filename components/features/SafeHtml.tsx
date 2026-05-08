"use client";

import { useEffect, useState } from "react";

interface SafeHtmlProps {
  html: string;
  className?: string;
  style?: React.CSSProperties;
  allowedTags?: string[];
}

/**
 * Safely renders HTML content by sanitizing it client-side
 * Falls back to escaped text during SSR
 */
export default function SafeHtml({ html, className, style, allowedTags }: SafeHtmlProps) {
  const [sanitized, setSanitized] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Dynamic import only runs on client (after hydration)
        const DOMPurify = (await import("dompurify")).default;
        if (!cancelled) {
          const purified = DOMPurify.sanitize(html, {
            ALLOWED_TAGS: allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'a'],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
          });
          setSanitized(purified);
        }
      } catch {
        // Fallback: escape
        if (!cancelled) {
          setSanitized(html.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        }
      }
    })();
    return () => { cancelled = true; };
  }, [html, allowedTags]);

  // During SSR, render escaped text to avoid hydration mismatch
  if (!sanitized) {
    return <span className={className} style={style}>{html.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>;
  }

  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
