"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { useTheme } from "@/components/theme/ThemeProvider";
import { PERSONAS, type PersonaConfig } from "@/lib/personas";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface PersonaSelectorProps {
  selected: string;
  onSelect: (persona: PersonaConfig) => void;
}

export default function PersonaSelector({ selected, onSelect }: PersonaSelectorProps) {
  const { t } = useLocale();
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 200;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full flex items-center justify-center"
        style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}15` }}
        aria-label={t.ui.prevPersona}
      >
        <ChevronLeft size={14} style={{ color: c.textMuted }} />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full flex items-center justify-center"
        style={{ backgroundColor: c.surface, border: `1px solid ${c.primary}15` }}
        aria-label={t.ui.nextPersona}
      >
        <ChevronRight size={14} style={{ color: c.textMuted }} />
      </button>

      {/* Persona cards — horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-0 py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {PERSONAS.map((p) => {
          const isSelected = p.id === selected;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: isSelected ? `${c.primary}18` : c.surface,
                border: `1px solid ${isSelected ? c.primary : `${c.primary}10`}`,
                color: isSelected ? c.primary : c.text,
                boxShadow: isSelected ? `0 0 12px ${c.primary}20` : "none",
              }}
            >
              <span className="text-lg">{p.emoji}</span>
              <span className="font-medium whitespace-nowrap">{t.personas[p.id]?.name || p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
