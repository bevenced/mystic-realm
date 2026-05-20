"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isUser = role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 ${
        isUser ? "animate-slide-in-right" : "animate-slide-in-left"
      }`}
    >
      <div
        className="max-w-[80%] md:max-w-[70%] px-4 py-3 min-h-[44px] rounded-lg text-sm leading-relaxed"
        style={{
          backgroundColor: isUser ? `${c.primary}15` : `${c.surface}`,
          border: isUser ? "none" : `1px solid ${c.primary}10`,
          color: c.text,
          borderBottomRightRadius: isUser ? 2 : undefined,
          borderBottomLeftRadius: isUser ? undefined : 2,
        }}
      >
        {content || (isStreaming ? "" : "")}
        {isStreaming && isUser === false && (
          <span className="inline-flex gap-0.5 ml-1">
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
