"use client";

import { useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

export interface RevealedCard {
  name: string;
  position: string;
  isReversed: boolean;
  emoji: string;
  keywords: string[];
}

interface TarotCardRevealProps {
  cards: RevealedCard[];
  reading: {
    overview?: string;
    cards?: { position: string; interpretation: string; advice: string }[];
    summary?: string;
    affirmation?: string;
    preview?: string;
  };
  isPaid: boolean;
  isRevealed: boolean;
}

export default function TarotCardReveal({ cards, reading, isPaid, isRevealed }: TarotCardRevealProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const handleFlip = (index: number) => {
    setFlippedCards((prev) => new Set(prev).add(index));
  };

  // Auto-flip cards with staggered delay
  if (isRevealed && flippedCards.size < cards.length) {
    cards.forEach((_, i) => {
      setTimeout(() => handleFlip(i), i * 400 + 500);
    });
  }

  return (
    <div>
      {/* Cards grid */}
      <div
        className={`grid gap-4 mb-8 ${
          cards.length <= 3
            ? "grid-cols-1 sm:grid-cols-3"
            : cards.length <= 5
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
        }`}
      >
        {cards.map((card, i) => {
          const isFlipped = flippedCards.has(i);
          return (
            <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 200}ms` }}>
              {/* Position label */}
              <p
                className="text-xs text-center mb-2 tracking-wider uppercase"
                style={{ color: c.textMuted }}
              >
                {card.position}
              </p>

              {/* Card flip container */}
              <div
                className="cursor-pointer"
                style={{ perspective: "600px", height: 160 }}
                onClick={() => handleFlip(i)}
              >
                <div
                  className="relative w-full h-full"
                  style={{
                    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Card back */}
                  <div
                    className="absolute inset-0 rounded-xl flex items-center justify-center"
                    style={{
                      backfaceVisibility: "hidden",
                      background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`,
                      boxShadow: `0 4px 20px ${currentTheme.glow}`,
                    }}
                  >
                    <span className="text-4xl opacity-30">✦</span>
                  </div>

                  {/* Card front */}
                  <div
                    className="absolute inset-0 rounded-xl flex flex-col items-center justify-center p-3"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      background: c.surface,
                      border: `1px solid ${c.primary}44`,
                    }}
                  >
                    <span className="text-3xl mb-1">{card.emoji}</span>
                    <p
                      className="text-xs font-semibold text-center leading-tight mb-1"
                      style={{ color: c.primary }}
                    >
                      {card.name}
                    </p>
                    <p
                      className="text-xs text-center"
                      style={{
                        color: card.isReversed ? "#E74C3C" : c.textMuted,
                        fontSize: "10px",
                      }}
                    >
                      {card.isReversed ? "Reversed" : "Upright"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reading result */}
      {isRevealed && reading && (
        <div className="animate-fade-in" style={{ animationDelay: `${cards.length * 200 + 300}ms` }}>
          {!isPaid && reading.preview ? (
            /* Free preview */
            <div
              className="rounded-xl p-6 mb-4"
              style={{
                background: `${c.primary}08`,
                border: `1px solid ${c.primary}22`,
              }}
            >
              <p className="text-sm leading-relaxed" style={{ color: c.text }}>
                {reading.preview}
              </p>
            </div>
          ) : isPaid && reading.overview ? (
            /* Full reading */
            <div className="space-y-6">
              {/* Overview */}
              <div
                className="rounded-xl p-6"
                style={{
                  background: `${c.primary}08`,
                  border: `1px solid ${c.primary}22`,
                }}
              >
                <h3
                  className="text-sm font-semibold tracking-wider uppercase mb-3"
                  style={{ color: c.primary }}
                >
                  Overview
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: c.text }}>
                  {reading.overview}
                </p>
              </div>

              {/* Individual card interpretations */}
              {reading.cards && reading.cards.length > 0 && (
                <div className="space-y-4">
                  {reading.cards.map((cardReading, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-5"
                      style={{
                        background: c.surface,
                        border: `1px solid ${c.primary}15`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{cards[i]?.emoji}</span>
                        <h4 className="text-sm font-semibold" style={{ color: c.primary }}>
                          {cardReading.position}
                        </h4>
                      </div>
                      <p className="text-sm leading-relaxed mb-2" style={{ color: c.text }}>
                        {cardReading.interpretation}
                      </p>
                      {cardReading.advice && (
                        <p
                          className="text-xs leading-relaxed italic"
                          style={{ color: c.textMuted }}
                        >
                          ✦ {cardReading.advice}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              {reading.summary && (
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: `${c.accent}10`,
                    border: `1px solid ${c.accent}33`,
                  }}
                >
                  <h3
                    className="text-sm font-semibold tracking-wider uppercase mb-3"
                    style={{ color: c.accent }}
                  >
                    Summary
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: c.text }}>
                    {reading.summary}
                  </p>
                </div>
              )}

              {/* Affirmation */}
              {reading.affirmation && (
                <div
                  className="rounded-xl p-6 text-center glow"
                  style={{ background: `${c.primary}08` }}
                >
                  <p
                    className="text-xs tracking-wider uppercase mb-2"
                    style={{ color: c.textMuted }}
                  >
                    Your Affirmation
                  </p>
                  <p className="text-base italic font-medium" style={{ color: c.primary }}>
                    &ldquo;{reading.affirmation}&rdquo;
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
