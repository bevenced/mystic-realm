"use client";

import { Sparkles, ShoppingBag, BookOpen } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Readings",
    desc: "Get personalized tarot, astrology, and BaZi readings powered by advanced AI.",
  },
  {
    icon: ShoppingBag,
    title: "Curated Products",
    desc: "Discover handpicked crystals, incense, tarot decks, and mystical tools.",
  },
  {
    icon: BookOpen,
    title: "Guided Articles",
    desc: "Deepen your practice with expert guides, meditations, and cosmic insights.",
  },
];

export default function FeatureSection() {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-5xl">
        {/* 标题 */}
        <div className="text-center mb-14">
          <p
            className="text-sm tracking-widest uppercase mb-3"
            style={{ color: "var(--color-text-muted)" }}
          >
            What Awaits You
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            Three Paths, One Destination
          </h2>
        </div>

        {/* 三列 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="text-center group">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                style={{
                  backgroundColor: "var(--color-primary)15",
                  color: "var(--color-primary)",
                }}
              >
                <f.icon size={28} />
              </div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--color-text)" }}
              >
                {f.title}
              </h3>
              <p
                className="text-base leading-relaxed max-w-xs mx-auto"
                style={{ color: "var(--color-text-muted)" }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
