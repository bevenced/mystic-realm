"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  personaEmoji?: string;
}

export default function ChatMessage({ role, content, isStreaming, personaEmoji }: ChatMessageProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isUser = role === "user";
  const isDark = currentTheme.isDark;

  const markdownComponents: Components = {
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    strong: ({ children }) => <strong style={{ color: c.primary }}>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1 last:mb-0">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1 last:mb-0">{children}</ol>,
    blockquote: ({ children }) => (
      <blockquote
        className="pl-4 py-2 my-2 rounded-r-lg last:mb-0"
        style={{
          borderLeft: `3px solid ${c.primary}`,
          backgroundColor: `${c.primary}08`,
          color: c.textMuted,
        }}
      >
        {children}
      </blockquote>
    ),
    code: ({ children, ...props }) => {
      const { className, ...rest } = props as any;
      const isInline = !className;
      if (isInline) {
        return (
          <code
            className="px-1.5 py-0.5 rounded text-[0.85em]"
            style={{ backgroundColor: `${c.primary}12`, color: c.primary }}
            {...rest}
          >
            {children}
          </code>
        );
      }
      return (
        <pre
          className="overflow-x-auto rounded-lg p-4 my-2 text-sm last:mb-0"
          style={{ backgroundColor: isDark ? `${c.surface}` : `${c.bg}`, border: `1px solid ${c.primary}10` }}
        >
          <code {...rest}>{children}</code>
        </pre>
      );
    },
    a: ({ children, href }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: c.primary, textDecoration: "underline" }}>
        {children}
      </a>
    ),
    hr: () => <hr className="my-3" style={{ borderColor: `${c.primary}15` }} />,
  };

  return (
    <div className={`flex items-end gap-3 mb-4 ${isUser ? "justify-end" : "justify-start"} ${
      isUser ? "animate-slide-in-right" : "animate-slide-in-left"
    }`}>
      {/* Assistant avatar */}
      {!isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base"
          style={{
            backgroundColor: `${c.surface}`,
            border: `1px solid ${c.primary}15`,
            boxShadow: `0 0 8px ${c.primary}12`,
          }}
        >
          {personaEmoji || "✨"}
        </div>
      )}

      {/* Message bubble */}
      <div
        className="max-w-[80%] md:max-w-[70%] px-4 py-3 min-h-[44px] text-sm leading-relaxed"
        style={{
          backgroundColor: isUser ? `${c.primary}12` : `${c.surface}`,
          border: isUser ? "none" : `1px solid ${c.primary}10`,
          color: c.text,
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          boxShadow: isUser
            ? `0 2px 8px ${c.primary}08`
            : `0 2px 8px ${c.primary}06`,
        }}
      >
        {isUser ? (
          content
        ) : content ? (
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        ) : null}

        {isStreaming && !isUser && (
          <span className="inline-flex gap-1 ml-1">
            <span
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ backgroundColor: c.primary, animationDelay: "0ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ backgroundColor: c.primary, animationDelay: "200ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ backgroundColor: c.primary, animationDelay: "400ms" }}
            />
          </span>
        )}
      </div>
    </div>
  );
}
