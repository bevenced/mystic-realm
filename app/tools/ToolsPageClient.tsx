"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Sparkles, ChevronRight, Loader2 } from "lucide-react";
import ServiceCard, { SERVICES } from "@/components/features/ServiceCard";
import TarotSpreadSelector from "@/components/features/TarotSpreadSelector";
import PayPalButton from "@/components/features/PayPalButton";
import { getSpread } from "@/lib/tarot";
import { v4 as uuidv4 } from "uuid";

type Step = 1 | 2 | 3;

export default function ToolsPageClient() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;
  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme");

  // State
  const [step, setStep] = useState<Step>(1);
  const [activeService, setActiveService] = useState(
    themeParam === "tarot" ? "tarot" : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [readingId, setReadingId] = useState("");
  const [reading, setReading] = useState<Record<string, unknown>>({});
  const [extraData, setExtraData] = useState<Record<string, unknown>>({});
  const [isPaidResult, setIsPaidResult] = useState(false);

  // Tarot-specific state
  const [spreadKey, setSpreadKey] = useState("three-card");
  const [tarotCards, setTarotCards] = useState<Array<{ name: string; position: string; isReversed: boolean; emoji: string; keywords: string[] }>>([]);

  // BaZi state
  const [baziDate, setBaziDate] = useState("");
  const [baziHour, setBaziHour] = useState(12);
  const [baziGender, setBaziGender] = useState<"male" | "female">("male");

  // Feng Shui state
  const [homeType, setHomeType] = useState("apartment");
  const [roomDesc, setRoomDesc] = useState("");
  const [fengShuiConcerns, setFengShuiConcerns] = useState("");

  // Astrology state
  const [astroDate, setAstroDate] = useState("");
  const [astroHour, setAstroHour] = useState(12);

  // Meditation state
  const [meditationType, setMeditationType] = useState("stress");
  const [meditationDuration, setMeditationDuration] = useState("10");
  const [meditationMood, setMeditationMood] = useState("");

  const spread = spreadKey ? getSpread(spreadKey) : null;
  const activeTextColor = isDark ? c.bg : "#FFFFFF";

  // Generic submit handler
  const handleSubmit = async (isPaid: boolean) => {
    if (!activeService) return;
    setLoading(true);
    setError("");
    const id = uuidv4();
    if (!isPaid) setReadingId(id);

    try {
      let endpoint = "";
      let body: Record<string, unknown> = {};

      switch (activeService) {
        case "tarot":
          endpoint = "/api/ai-reading";
          body = { spreadKey, question: "General reading", isPaid };
          break;
        case "bazi":
          if (!baziDate) { setError("Please enter your birth date."); setLoading(false); return; }
          endpoint = "/api/ai-bazi";
          body = { birthDate: baziDate, birthHour: baziHour, gender: baziGender, isPaid };
          break;
        case "fengshui":
          if (roomDesc.length < 10) { setError("Please describe your space (at least 10 characters)."); setLoading(false); return; }
          endpoint = "/api/ai-fengshui";
          body = { homeType, roomDescription: roomDesc, concerns: fengShuiConcerns, isPaid };
          break;
        case "astrology":
          if (!astroDate) { setError("Please enter your birth date."); setLoading(false); return; }
          endpoint = "/api/ai-astrology";
          body = { birthDate: astroDate, birthHour: astroHour, isPaid };
          break;
        case "meditation":
          endpoint = "/api/ai-meditation";
          body = { type: meditationType, duration: meditationDuration, mood: meditationMood, isPaid };
          break;
      }

      const res = await fetch(endpoint!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setReading(data.reading);
      setExtraData(data.baziData || data.zodiacData || {});
      if (activeService === "tarot") setTarotCards(data.cards);
      setIsPaidResult(isPaid);
      setStep(3);

      // Save paid readings to localStorage
      if (isPaid) {
        const history = JSON.parse(localStorage.getItem("mystic-readings") || "[]");
        history.unshift({
          id: readingId || id,
          service: activeService,
          reading: data.reading,
          extra: data.baziData || data.zodiacData || {},
          isPaid: true,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("mystic-readings", JSON.stringify(history.slice(0, 50)));
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    handleSubmit(true);
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setReading({});
      setExtraData({});
      setIsPaidResult(false);
      setTarotCards([]);
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleReset = () => {
    setStep(1);
    setActiveService("");
    setReading({});
    setExtraData({});
    setIsPaidResult(false);
    setTarotCards([]);
    setError("");
  };

  const getPrice = () => {
    if (activeService === "tarot") return spread?.price || 4.99;
    const svc = SERVICES.find((s) => s.key === activeService);
    return svc?.price || 4.99;
  };

  return (
    <main className="min-h-screen">
      <div className="relative">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${c.primary}12 0%, transparent 50%)`,
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-20">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="w-12 h-px mx-auto mb-6" style={{ background: c.primary }} />
            <div className="flex items-center justify-center gap-3 mb-3">
              <Sparkles size={24} style={{ color: c.primary }} />
              <h1 className="text-3xl md:text-4xl font-bold tracking-wider" style={{ color: c.primary }}>
                AI Mystical Tools
              </h1>
              <Sparkles size={24} style={{ color: c.primary }} />
            </div>
            <p className="text-sm" style={{ color: c.textMuted }}>
              Choose a service and receive personalized AI-powered guidance.
            </p>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mt-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: step >= s ? c.primary : `${c.primary}15`,
                      color: step >= s ? activeTextColor : c.primary,
                    }}
                  >
                    {s}
                  </div>
                  {s < 3 && <ChevronRight size={14} style={{ color: c.textMuted }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Choose Service */}
          {step === 1 && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <h2 className="text-xl font-semibold mb-2 text-center" style={{ color: c.text }}>
                Choose Your Service
              </h2>
              <p className="text-sm text-center mb-8" style={{ color: c.textMuted }}>
                Each service includes a free preview. Unlock full readings with PayPal.
              </p>

              <div className="space-y-3">
                {SERVICES.map((service, i) => (
                  <div key={service.key} style={{ animationDelay: `${i * 100}ms` }}>
                    <ServiceCard
                      service={service}
                      isSelected={activeService === service.key}
                      onSelect={setActiveService}
                    />
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => { if (activeService) setStep(2); }}
                  disabled={!activeService}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-base font-semibold transition-all"
                  style={{
                    backgroundColor: activeService ? c.primary : `${c.primary}30`,
                    color: activeService ? activeTextColor : c.textMuted,
                    cursor: activeService ? "pointer" : "not-allowed",
                    boxShadow: activeService ? `0 0 20px ${currentTheme.glow}` : "none",
                  }}
                >
                  Continue
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Input Form (varies by service) */}
          {step === 2 && (
            <div className="animate-slide-up max-w-xl mx-auto">
              <h2 className="text-xl font-semibold mb-2 text-center" style={{ color: c.text }}>
                {SERVICES.find((s) => s.key === activeService)?.emoji}{" "}
                {SERVICES.find((s) => s.key === activeService)?.name}
              </h2>
              <p className="text-sm text-center mb-6" style={{ color: c.textMuted }}>
                Free preview included &middot; Full reading ${getPrice().toFixed(2)}
              </p>

              <div className="rounded-xl p-6" style={{ background: c.surface, border: `1px solid ${c.primary}22` }}>
                {/* ===== TAROT FORM ===== */}
                {activeService === "tarot" && (
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: c.text }}>
                      Choose Your Spread
                    </label>
                    <TarotSpreadSelector selected={spreadKey} onSelect={setSpreadKey} />
                  </div>
                )}

                {/* ===== BAZI FORM ===== */}
                {activeService === "bazi" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                        Birth Date
                      </label>
                      <input
                        type="date"
                        value={baziDate}
                        onChange={(e) => setBaziDate(e.target.value)}
                        className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                        style={{
                          backgroundColor: `${c.primary}08`,
                          border: `1px solid ${c.primary}22`,
                          color: c.text,
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                          Birth Hour
                        </label>
                        <select
                          value={baziHour}
                          onChange={(e) => setBaziHour(Number(e.target.value))}
                          className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                          style={{
                            backgroundColor: `${c.primary}08`,
                            border: `1px solid ${c.primary}22`,
                            color: c.text,
                          }}
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i} style={{ background: c.surface }}>
                              {i.toString().padStart(2, "0")}:00
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                          Gender
                        </label>
                        <div className="flex gap-2">
                          {(["male", "female"] as const).map((g) => (
                            <button
                              key={g}
                              onClick={() => setBaziGender(g)}
                              className="flex-1 py-3 rounded-lg text-sm font-medium transition-all"
                              style={{
                                backgroundColor: baziGender === g ? c.primary : `${c.primary}08`,
                                color: baziGender === g ? activeTextColor : c.textMuted,
                                border: `1px solid ${c.primary}33`,
                              }}
                            >
                              {g === "male" ? "♂ Male" : "♀ Female"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== FENG SHUI FORM ===== */}
                {activeService === "fengshui" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                        Home Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["apartment", "house", "studio", "office"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setHomeType(t)}
                            className="py-2.5 rounded-lg text-sm capitalize transition-all"
                            style={{
                              backgroundColor: homeType === t ? c.primary : `${c.primary}08`,
                              color: homeType === t ? activeTextColor : c.textMuted,
                              border: `1px solid ${c.primary}33`,
                            }}
                          >
                            {t === "office" ? "🏢 Office" : t === "apartment" ? "🏢 Apartment" : t === "house" ? "🏠 House" : "🏡 Studio"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                        Describe Your Space
                      </label>
                      <textarea
                        value={roomDesc}
                        onChange={(e) => setRoomDesc(e.target.value)}
                        placeholder="Describe the layout, rooms, orientation, and any features of your space..."
                        className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-none"
                        style={{
                          backgroundColor: `${c.primary}08`,
                          border: `1px solid ${c.primary}22`,
                          color: c.text,
                          minHeight: 100,
                        }}
                        maxLength={1000}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                        Specific Concerns (Optional)
                      </label>
                      <input
                        type="text"
                        value={fengShuiConcerns}
                        onChange={(e) => setFengShuiConcerns(e.target.value)}
                        placeholder="e.g., poor sleep, career stagnation, relationship tension"
                        className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                        style={{
                          backgroundColor: `${c.primary}08`,
                          border: `1px solid ${c.primary}22`,
                          color: c.text,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* ===== ASTROLOGY FORM ===== */}
                {activeService === "astrology" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                        Birth Date
                      </label>
                      <input
                        type="date"
                        value={astroDate}
                        onChange={(e) => setAstroDate(e.target.value)}
                        className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                        style={{
                          backgroundColor: `${c.primary}08`,
                          border: `1px solid ${c.primary}22`,
                          color: c.text,
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                        Birth Hour (for Moon & Rising signs)
                      </label>
                      <select
                        value={astroHour}
                        onChange={(e) => setAstroHour(Number(e.target.value))}
                        className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                        style={{
                          backgroundColor: `${c.primary}08`,
                          border: `1px solid ${c.primary}22`,
                          color: c.text,
                        }}
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i} style={{ background: c.surface }}>
                            {i.toString().padStart(2, "0")}:00
                          </option>
                        ))}
                      </select>
                      <p className="text-xs mt-1" style={{ color: c.textMuted }}>
                        If you don't know your exact birth time, noon (12:00) is a reasonable default.
                      </p>
                    </div>
                  </div>
                )}

                {/* ===== MEDITATION FORM ===== */}
                {activeService === "meditation" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                        Meditation Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          { key: "stress", label: "😌 Stress Release" },
                          { key: "sleep", label: "😴 Deep Sleep" },
                          { key: "focus", label: "🎯 Mental Focus" },
                          { key: "self-healing", label: "💚 Self-Healing" },
                          { key: "gratitude", label: "🙏 Gratitude" },
                        ] as const).map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => setMeditationType(opt.key)}
                            className="py-2.5 rounded-lg text-sm transition-all"
                            style={{
                              backgroundColor: meditationType === opt.key ? c.primary : `${c.primary}08`,
                              color: meditationType === opt.key ? activeTextColor : c.textMuted,
                              border: `1px solid ${c.primary}33`,
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                        Duration
                      </label>
                      <div className="flex gap-2">
                        {["5", "10", "15"].map((d) => (
                          <button
                            key={d}
                            onClick={() => setMeditationDuration(d)}
                            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                            style={{
                              backgroundColor: meditationDuration === d ? c.primary : `${c.primary}08`,
                              color: meditationDuration === d ? activeTextColor : c.textMuted,
                              border: `1px solid ${c.primary}33`,
                            }}
                          >
                            {d} min
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                        Current Mood / Concern (Optional)
                      </label>
                      <textarea
                        value={meditationMood}
                        onChange={(e) => setMeditationMood(e.target.value)}
                        placeholder="What's on your mind right now? (helps personalize your session)"
                        className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-none"
                        style={{
                          backgroundColor: `${c.primary}08`,
                          border: `1px solid ${c.primary}22`,
                          color: c.text,
                          minHeight: 80,
                        }}
                        maxLength={500}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 rounded-full text-sm transition-colors"
                  style={{
                    border: `1px solid ${c.primary}33`,
                    color: c.textMuted,
                    backgroundColor: "transparent",
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-base font-semibold transition-all"
                  style={{
                    backgroundColor: !loading ? c.primary : `${c.primary}30`,
                    color: !loading ? activeTextColor : c.textMuted,
                    cursor: !loading ? "pointer" : "not-allowed",
                    boxShadow: !loading ? `0 0 20px ${currentTheme.glow}` : "none",
                  }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {loading ? "Generating..." : "Free Preview"}
                </button>
              </div>

              {error && (
                <div
                  className="mt-4 rounded-lg p-3 text-center text-sm"
                  style={{ backgroundColor: "#E74C3C15", color: "#E74C3C", border: "1px solid #E74C3C33" }}
                >
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <button onClick={handleBack} className="text-sm flex items-center gap-1 transition-colors" style={{ color: c.textMuted }}>
                  ← Back
                </button>
                <button
                  onClick={handleReset}
                  className="text-sm px-4 py-1.5 rounded-full transition-colors"
                  style={{ border: `1px solid ${c.primary}33`, color: c.textMuted, backgroundColor: "transparent" }}
                >
                  New Reading
                </button>
              </div>

              <ResultDisplay
                service={activeService}
                reading={reading}
                extraData={extraData}
                tarotCards={tarotCards}
                isPaid={isPaidResult}
              />

              {!isPaidResult && (
                <div className="animate-slide-up text-center mt-6 mb-2">
                  <p className="text-xs tracking-wider uppercase mb-1" style={{ color: c.textMuted }}>
                    Want the full interpretation?
                  </p>
                  <p className="text-sm mb-4" style={{ color: c.text }}>
                    Unlock detailed analysis and personalized guidance for ${getPrice().toFixed(2)}.
                  </p>
                  <PayPalButton
                    amount={getPrice()}
                    spreadKey={activeService}
                    readingId={readingId}
                    onSuccess={handlePaymentSuccess}
                    onError={setError}
                  />
                </div>
              )}

              {error && (
                <div
                  className="mt-4 rounded-lg p-3 text-center text-sm"
                  style={{ backgroundColor: "#E74C3C15", color: "#E74C3C", border: "1px solid #E74C3C33" }}
                >
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ===== Result Display Component =====
function ResultDisplay({
  service,
  reading,
  extraData,
  tarotCards,
  isPaid,
}: {
  service: string;
  reading: Record<string, unknown>;
  extraData: Record<string, unknown>;
  tarotCards: Array<{ name: string; position: string; isReversed: boolean; emoji: string; keywords: string[] }>;
  isPaid: boolean;
}) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;

  // Free preview
  if (!isPaid && reading.preview) {
    return (
      <div className="rounded-xl p-6 animate-fade-in" style={{ background: `${c.primary}08`, border: `1px solid ${c.primary}22` }}>
        <p className="text-sm leading-relaxed" style={{ color: c.text }}>{reading.preview as string}</p>
      </div>
    );
  }

  // Tarot result — show card grid
  if (service === "tarot" && tarotCards.length > 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 mb-6" style={{
          gridTemplateColumns: tarotCards.length <= 3 ? "repeat(auto-fit, minmax(140px, 1fr))" : "repeat(auto-fit, minmax(120px, 1fr))",
        }}>
          {tarotCards.map((card, i) => (
            <div key={i} className="rounded-xl p-4 text-center" style={{ background: c.surface, border: `1px solid ${c.primary}22` }}>
              <p className="text-xs mb-1 uppercase tracking-wider" style={{ color: c.textMuted }}>{card.position}</p>
              <span className="text-3xl">{card.emoji}</span>
              <p className="text-xs font-semibold mt-1" style={{ color: c.primary }}>{card.name}</p>
              <p className="text-xs mt-0.5" style={{ color: card.isReversed ? "#E74C3C" : c.textMuted }}>
                {card.isReversed ? "Reversed" : "Upright"}
              </p>
            </div>
          ))}
        </div>
        <FullReadingSections reading={reading} />
      </div>
    );
  }

  // BaZi result — show four pillars
  if (service === "bazi" && extraData.year) {
    const ed = extraData as Record<string, Record<string, string>>;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["year", "month", "day", "hour"] as const).map((pillar) => {
            const p = ed[pillar];
            if (!p) return null;
            return (
              <div key={pillar} className="rounded-xl p-4 text-center" style={{ background: c.surface, border: `1px solid ${c.primary}22` }}>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>{pillar} Pillar</p>
                <p className="text-2xl font-bold" style={{ color: c.primary }}>{p.stem}{p.branch}</p>
                <p className="text-xs mt-1" style={{ color: c.textMuted }}>{p.stemEn} / {p.branchEn}</p>
                <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>{p.stemElement} / {p.branchElement}</p>
              </div>
            );
          })}
        </div>
        <FullReadingSections reading={reading} />
      </div>
    );
  }

  // Astrology result — show big three
  if (service === "astrology" && extraData.sunSign) {
    const ed = extraData as Record<string, string>;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "☀ Sun", value: `${ed.sunSign} ${ed.sunSymbol}`, sub: ed.element },
            { label: "☽ Moon", value: `${ed.moonSign} ${ed.moonSymbol}`, sub: "Emotions" },
            { label: "⬆ Rising", value: `${ed.risingSign} ${ed.risingSymbol}`, sub: ed.modality },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-4 text-center" style={{ background: c.surface, border: `1px solid ${c.primary}22` }}>
              <p className="text-xs" style={{ color: c.textMuted }}>{item.label}</p>
              <p className="text-xl font-bold mt-1" style={{ color: c.primary }}>{item.value}</p>
              <p className="text-xs mt-1" style={{ color: c.textMuted }}>{item.sub}</p>
            </div>
          ))}
        </div>
        <FullReadingSections reading={reading} />
      </div>
    );
  }

  // Generic result (Feng Shui, Meditation)
  return (
    <div className="animate-fade-in">
      <FullReadingSections reading={reading} />
    </div>
  );
}

// ===== Full Reading Sections =====
function FullReadingSections({ reading }: { reading: Record<string, unknown> }) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;

  if (!reading || typeof reading !== "object") return null;

  const sections: Array<{ title: string; content: string | unknown }> = [];

  // Overview
  if (reading.overview) sections.push({ title: "Overview", content: reading.overview });

  // Day Master (BaZi)
  if (reading.dayMaster) sections.push({ title: "Day Master", content: reading.dayMaster });

  // Element Analysis (BaZi)
  if (reading.elementAnalysis) {
    const ea = reading.elementAnalysis as Record<string, unknown>;
    if (typeof ea === "object") sections.push({ title: "Element Analysis", content: JSON.stringify(ea) });
  }

  // Big Three (Astrology)
  if (reading.bigThree) {
    const bt = reading.bigThree as Record<string, unknown>;
    if (typeof bt === "object") {
      if (bt.sun) sections.push({ title: "☀ Sun Sign", content: bt.sun });
      if (bt.moon) sections.push({ title: "☽ Moon Sign", content: bt.moon });
      if (bt.rising) sections.push({ title: "⬆ Rising Sign", content: bt.rising });
    }
  }

  // Life Aspects
  if (reading.lifeAspects) {
    const la = reading.lifeAspects as Record<string, unknown>;
    if (typeof la === "object") {
      if (la.personality) sections.push({ title: "Personality", content: la.personality });
      if (la.career) sections.push({ title: "Career", content: la.career });
      if (la.relationships) sections.push({ title: "Relationships", content: la.relationships });
      if (la.health) sections.push({ title: "Health", content: la.health });
      if (la.love) sections.push({ title: "Love", content: la.love });
      if (la.growth) sections.push({ title: "Growth", content: la.growth });
    }
  }

  // Pillars (BaZi)
  if (Array.isArray(reading.pillars)) {
    sections.push({ title: "Pillar Analysis", content: JSON.stringify(reading.pillars) });
  }

  // Areas (Feng Shui)
  if (Array.isArray(reading.areas)) {
    const areas = reading.areas as Array<{ name: string; rating?: string; analysis?: string; suggestions?: string[] }>;
    for (const area of areas) {
      if (area.analysis) {
        let content = area.analysis;
        if (area.suggestions && area.suggestions.length > 0) {
          content += "\n\nSuggestions:\n" + area.suggestions.map((s) => `• ${s}`).join("\n");
        }
        sections.push({ title: `${area.name}${area.rating ? ` (${area.rating})` : ""}`, content });
      }
    }
  }

  // Colors (Feng Shui)
  if (reading.colors) {
    const cols = reading.colors as Record<string, unknown>;
    if (Array.isArray(cols.recommended)) {
      sections.push({ title: "🎨 Recommended Colors", content: cols.recommended.join(", ") });
    }
  }

  // Top Improvements (Feng Shui)
  if (Array.isArray(reading.topImprovements)) {
    sections.push({ title: "Top Improvements", content: (reading.topImprovements as string[]).map((i, idx) => `${idx + 1}. ${i}`).join("\n") });
  }

  // Meditation script
  if (Array.isArray(reading.script)) {
    const script = reading.script as Array<{ phase: string; instruction: string; duration?: string }>;
    for (const s of script) {
      sections.push({ title: `${s.phase.charAt(0).toUpperCase() + s.phase.slice(1)}${s.duration ? ` (${s.duration})` : ""}`, content: s.instruction });
    }
  }

  // Breathing Pattern (Meditation)
  if (reading.breathingPattern) {
    const bp = reading.breathingPattern as Record<string, unknown>;
    sections.push({
      title: "🌬 Breathing Pattern",
      content: `${bp.name}: Inhale ${bp.inhale}, Hold ${bp.hold || 0}, Exhale ${bp.exhale}`,
    });
  }

  // Affirmations
  if (Array.isArray(reading.affirmations)) {
    sections.push({
      title: "✨ Affirmations",
      content: (reading.affirmations as string[]).map((a) => `• "${a}"`).join("\n"),
    });
  }

  // Single affirmation
  if (reading.affirmation && !Array.isArray(reading.affirmations)) {
    sections.push({ title: "Your Affirmation", content: reading.affirmation as string });
  }

  // Advice
  if (reading.advice) sections.push({ title: "Advice", content: reading.advice });

  // Summary
  if (reading.summary) sections.push({ title: "Summary", content: reading.summary });

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div
          key={i}
          className="rounded-xl p-5 animate-fade-in"
          style={{
            background: i === sections.length - 1 && section.title === "Your Affirmation"
              ? `${c.primary}08`
              : i === 0
                ? `${c.primary}08`
                : c.surface,
            border: `1px solid ${c.primary}15`,
          }}
        >
          <h3 className="text-sm font-semibold tracking-wider uppercase mb-3" style={{ color: c.primary }}>
            {section.title}
          </h3>
          <div
            className="text-sm leading-relaxed whitespace-pre-line"
            style={{ color: c.text }}
            dangerouslySetInnerHTML={{
              __html: typeof section.content === "string"
                ? section.content.replace(/\n/g, "<br/>")
                : JSON.stringify(section.content, null, 2),
            }}
          />
        </div>
      ))}
    </div>
  );
}
