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

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div
        className="text-5xl mb-5 animate-float-slow"
        style={{ color: c.primary }}
      >
        {personaEmoji}
      </div>
      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: c.primary }}
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
            className="w-full text-left px-5 py-3 rounded-lg text-sm transition-all hover-lift"
            style={{
              backgroundColor: `${c.surface}`,
              border: `1px solid ${c.primary}15`,
              color: c.text,
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
