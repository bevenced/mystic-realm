"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { CHAT_STYLES, type ChatStyle } from "@/lib/chat-styles";

interface AgentStyleSelectorProps {
  selected: string;
  onSelect: (style: ChatStyle) => void;
  disabled?: boolean;
}

export default function AgentStyleSelector({
  selected,
  onSelect,
  disabled,
}: AgentStyleSelectorProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;

  if (CHAT_STYLES.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-1 py-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      {CHAT_STYLES.map((style) => {
        const isSelected = style.id === selected;
        return (
          <button
            key={style.id}
            onClick={() => !disabled && onSelect(style)}
            disabled={disabled}
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs transition-all duration-200"
            style={{
              backgroundColor: isSelected ? c.primary : `${c.primary}08`,
              color: isSelected ? (currentTheme.isDark ? c.bg : "#FFFFFF") : c.textMuted,
              border: `1px solid ${isSelected ? c.primary : `${c.primary}12`}`,
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
            title={style.description}
          >
            <span className="text-xs">{style.emoji}</span>
            <span className="font-medium whitespace-nowrap">{style.name}</span>
          </button>
        );
      })}
    </div>
  );
}
