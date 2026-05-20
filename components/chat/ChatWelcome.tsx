"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

interface ChatWelcomeProps {
  personaEmoji: string;
  personaName: string;
  starterQuestions: string[];
  onSelectQuestion: (q: string) => void;
}

export default function ChatWelcome({
  personaEmoji,
  personaName,
  starterQuestions,
  onSelectQuestion,
}: ChatWelcomeProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {/* Emoji with glow backdrop */}
      <div className="relative mb-5">
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div
            className="w-24 h-24 rounded-full"
            style={{
              background: `radial-gradient(circle, ${c.primary}20 0%, transparent 70%)`,
            }}
          />
        </div>
        <div
          className="relative text-5xl animate-float-slow"
          style={{ color: c.primary }}
        >
          {personaEmoji}
        </div>
      </div>

      <h2
        className="text-2xl font-bold mb-2"
        style={{
          color: c.primary,
          textShadow: `0 0 20px ${c.primary}20`,
        }}
      >
        {personaName}
      </h2>

      <p
        className="text-sm max-w-md mb-10 leading-relaxed"
        style={{ color: c.textMuted }}
      >
        Ask me anything. I&apos;m here to guide you with wisdom and insight.
      </p>

      <div className="w-full max-w-lg space-y-2.5">
        {starterQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelectQuestion(q)}
            className="w-full text-left px-5 py-3 rounded-lg text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: `${c.surface}`,
              border: `1px solid ${c.primary}15`,
              color: c.text,
              boxShadow: `0 1px 4px ${c.primary}06`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = c.primary;
              e.currentTarget.style.boxShadow = `0 4px 16px ${c.primary}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${c.primary}15`;
              e.currentTarget.style.boxShadow = `0 1px 4px ${c.primary}06`;
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
