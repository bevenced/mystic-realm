"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Sparkles, ChevronRight, Loader2 } from "lucide-react";
import ServiceCard, { SERVICES } from "@/components/features/ServiceCard";
import TarotSpreadSelector from "@/components/features/TarotSpreadSelector";
import PayPalButton from "@/components/features/PayPalButton";
import { getSpread } from "@/lib/tarot";
import SafeHtml from "@/components/features/SafeHtml";
import ServiceProductRecommendations from "@/components/features/ServiceProductRecommendations";
import ReviewStars from "@/components/features/ReviewStars";
import PdfExportButton from "@/components/features/PdfExportButton";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Step = 1 | 2 | 3;

export default function ToolsPageClient() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;
  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme");
  const { t, tf } = useLocale();

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
  const [isFirstReading, setIsFirstReading] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("mystic-has-read");
    }
    return true;
  });

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
  const handleSubmit = async (orderId?: string) => {
    if (!activeService) return;
    const isPaid = !!orderId;
    setLoading(true);
    setError("");
    const id = crypto.randomUUID();
    if (!isPaid) setReadingId(id);

    try {
      let endpoint = "";
      let body: Record<string, unknown> = {};

      switch (activeService) {
        case "tarot":
          endpoint = "/api/ai-reading";
          body = { spreadKey, question: "General reading", ...(orderId && { orderId }) };
          break;
        case "bazi":
          if (!baziDate) { setError(t.tools.enterBirthDate); setLoading(false); return; }
          endpoint = "/api/ai-bazi";
          body = { birthDate: baziDate, birthHour: baziHour, gender: baziGender, ...(orderId && { orderId }) };
          break;
        case "fengshui":
          if (roomDesc.length < 10) { setError(t.tools.describeSpaceMin); setLoading(false); return; }
          endpoint = "/api/ai-fengshui";
          body = { homeType, roomDescription: roomDesc, concerns: fengShuiConcerns, ...(orderId && { orderId }) };
          break;
        case "astrology":
          if (!astroDate) { setError(t.tools.enterBirthDate); setLoading(false); return; }
          endpoint = "/api/ai-astrology";
          body = { birthDate: astroDate, birthHour: astroHour, ...(orderId && { orderId }) };
          break;
        case "meditation":
          endpoint = "/api/ai-meditation";
          body = { type: meditationType, duration: meditationDuration, mood: meditationMood, ...(orderId && { orderId }) };
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
      const baziExtra = data.baziData || data.zodiacData || {};
      setExtraData({
        ...baziExtra,
        birthDate: data.birthDate,
        birthHour: data.birthHour,
        gender: data.gender,
      });
      if (activeService === "tarot") setTarotCards(data.cards);
      setIsPaidResult(isPaid);
      setStep(3);

      // Save paid readings to localStorage
      if (isPaid) {
        localStorage.setItem("mystic-has-read", "true");
        setIsFirstReading(false);
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
      setError(t.tools.networkError);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    handleSubmit(orderId);
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
                {t.tools.title}
              </h1>
              <Sparkles size={24} style={{ color: c.primary }} />
            </div>
            <p className="text-sm" style={{ color: c.textMuted }}>
              {t.tools.subtitle}
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
                {t.tools.chooseService}
              </h2>
              <p className="text-sm text-center mb-8" style={{ color: c.textMuted }}>
                {t.tools.serviceDesc}
              </p>

              <div className="space-y-3">
                {SERVICES.map((service, i) => (
                  <div key={service.key} style={{ animationDelay: `${i * 100}ms` }}>
                    <ServiceCard
                      service={service}
                      isSelected={activeService === service.key}
                      onSelect={(key) => {
                        if (key === "compatibility") { window.location.href = "/compatibility"; return; }
                        setActiveService(key);
                      }}
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
                  {t.tools.continue_}
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
                {t.tools.freePreview} &middot;
                {isFirstReading ? (
                  <>
                    {t.tools.firstReading} <span className="line-through" style={{ color: c.textMuted }}>${getPrice().toFixed(2)}</span>
                    {" "}<span className="font-bold" style={{ color: c.primary }}>$1.99</span>
                  </>
                ) : (
                  <>{t.tools.fullReading} ${getPrice().toFixed(2)}</>
                )}
              </p>

              <div className="rounded-xl p-6" style={{ background: c.surface, border: `1px solid ${c.primary}22` }}>
                {/* ===== TAROT FORM ===== */}
                {activeService === "tarot" && (
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: c.text }}>
                      {t.tools.chooseSpread}
                    </label>
                    <TarotSpreadSelector selected={spreadKey} onSelect={setSpreadKey} />
                  </div>
                )}

                {/* ===== BAZI FORM ===== */}
                {activeService === "bazi" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                        {t.tools.birthDate}
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
                          {t.tools.birthHour}
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
                          {t.tools.gender}
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
                              {g === "male" ? `♂ ${t.tools.male}` : `♀ ${t.tools.female}`}
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
                        {t.tools.homeType}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["apartment", "house", "studio", "office"] as const).map((ht) => (
                          <button
                            key={ht}
                            onClick={() => setHomeType(ht)}
                            className="py-2.5 rounded-lg text-sm capitalize transition-all"
                            style={{
                              backgroundColor: homeType === ht ? c.primary : `${c.primary}08`,
                              color: homeType === ht ? activeTextColor : c.textMuted,
                              border: `1px solid ${c.primary}33`,
                            }}
                          >
                            {t.tools.homeTypes[ht] || ht}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                        {t.tools.describeSpace}
                      </label>
                      <textarea
                        value={roomDesc}
                        onChange={(e) => setRoomDesc(e.target.value)}
                        placeholder={t.tools.spacePlaceholder}
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
                        {t.tools.concerns}
                      </label>
                      <input
                        type="text"
                        value={fengShuiConcerns}
                        onChange={(e) => setFengShuiConcerns(e.target.value)}
                        placeholder={t.tools.concernsPlaceholder}
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
                        {t.tools.birthDate}
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
                        {t.tools.birthHour}
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
                        {t.tools.birthHourHelp}
                      </p>
                    </div>
                  </div>
                )}

                {/* ===== MEDITATION FORM ===== */}
                {activeService === "meditation" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                        {t.tools.meditationType}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["stress", "sleep", "focus", "self-healing", "gratitude"] as const).map((key) => (
                          <button
                            key={key}
                            onClick={() => setMeditationType(key)}
                            className="py-2.5 rounded-lg text-sm transition-all"
                            style={{
                              backgroundColor: meditationType === key ? c.primary : `${c.primary}08`,
                              color: meditationType === key ? activeTextColor : c.textMuted,
                              border: `1px solid ${c.primary}33`,
                            }}
                          >
                            {t.tools.meditationTypes[key] || key}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                        {t.tools.duration}
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
                            {d}{t.tools.minSuffix}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: c.text }}>
                        {t.tools.currentMood}
                      </label>
                      <textarea
                        value={meditationMood}
                        onChange={(e) => setMeditationMood(e.target.value)}
                        placeholder={t.tools.moodPlaceholder}
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
                  {t.tools.back}
                </button>
                <button
                  onClick={() => handleSubmit()}
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
                  {loading ? t.tools.generating : t.tools.freePreview}
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
                  ← {t.tools.back}
                </button>
                <button
                  onClick={handleReset}
                  className="text-sm px-4 py-1.5 rounded-full transition-colors"
                  style={{ border: `1px solid ${c.primary}33`, color: c.textMuted, backgroundColor: "transparent" }}
                >
                  {t.tools.newReading}
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
                    {t.tools.wantFullReading}
                  </p>
                  <p className="text-sm mb-4" style={{ color: c.text }}>
                    {t.tools.unlockFullReading} ${getPrice().toFixed(2)}.
                  </p>
                  <PayPalButton
                    amount={getPrice()}
                    spreadKey={activeService}
                    readingId={readingId}
                    isFirstReading={isFirstReading}
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

              {/* Product recommendations after paid reading */}
              {isPaidResult && (
                <>
                  <div className="flex items-center justify-center gap-3 mt-6 mb-2">
                    <PdfExportButton
                      type={activeService}
                      reading={reading}
                      extraData={extraData}
                      baziData={(reading as any).baziData}
                      birthDate={extraData.birthDate as string}
                      birthHour={extraData.birthHour as number}
                      gender={extraData.gender as string}
                    />
                  </div>
                  <ServiceProductRecommendations service={activeService} />
                  <ReviewStars service={activeService} />
                </>
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
  const { t } = useLocale();
  const c = currentTheme.colors;

  // Free preview — show service-specific data + preview text
  if (!isPaid && reading.preview) {
    const previewText = typeof reading.preview === "string" ? reading.preview : renderContent(reading.preview);
    return (
      <div className="space-y-4 animate-fade-in">
        {/* Tarot cards */}
        {tarotCards.length > 0 && (
          <div className="grid gap-4" style={{
            gridTemplateColumns: tarotCards.length <= 3 ? "repeat(auto-fit, minmax(140px, 1fr))" : "repeat(auto-fit, minmax(120px, 1fr))",
          }}>
            {tarotCards.map((card, i) => (
              <div key={i} className="rounded-xl p-4 text-center" style={{ background: c.surface, border: `1px solid ${c.primary}22` }}>
                <p className="text-xs mb-1 uppercase tracking-wider" style={{ color: c.textMuted }}>{card.position}</p>
                <span className="text-3xl">{card.emoji}</span>
                <p className="text-xs font-semibold mt-1" style={{ color: c.primary }}>{card.name}</p>
                <p className="text-xs mt-0.5" style={{ color: card.isReversed ? "#E74C3C" : c.textMuted }}>
                  {card.isReversed ? t.tools.tarotReversed : t.tools.tarotUpright}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* BaZi four pillars */}
        {service === "bazi" && "year" in extraData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["year", "month", "day", "hour"] as const).map((pillar) => {
              const p = (extraData as Record<string, Record<string, string>>)[pillar];
              if (!p) return null;
              return (
                <div key={pillar} className="rounded-xl p-4 text-center" style={{ background: c.surface, border: `1px solid ${c.primary}22` }}>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>{(t.dashboard as Record<string,string>)[pillar] || pillar}{t.tools.pillarSuffix}</p>
                  <p className="text-2xl font-bold" style={{ color: c.primary }}>{p.stem}{p.branch}</p>
                  <p className="text-xs mt-1" style={{ color: c.textMuted }}>{p.stemEn} / {p.branchEn}</p>
                  <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>{p.stemElement} / {p.branchElement}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Astrology big three */}
        {service === "astrology" && "sunSign" in extraData && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t.tools.astrologySun, value: `${(extraData as Record<string, string>).sunSign} ${(extraData as Record<string, string>).sunSymbol}`, sub: (extraData as Record<string, string>).element },
              { label: t.tools.astrologyMoon, value: `${(extraData as Record<string, string>).moonSign} ${(extraData as Record<string, string>).moonSymbol}`, sub: t.tools.astrologyEmotions },
              { label: t.tools.astrologyRising, value: `${(extraData as Record<string, string>).risingSign} ${(extraData as Record<string, string>).risingSymbol}`, sub: (extraData as Record<string, string>).modality },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-4 text-center" style={{ background: c.surface, border: `1px solid ${c.primary}22` }}>
                <p className="text-xs" style={{ color: c.textMuted }}>{item.label}</p>
                <p className="text-xl font-bold mt-1" style={{ color: c.primary }}>{item.value}</p>
                <p className="text-xs mt-1" style={{ color: c.textMuted }}>{item.sub}</p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl p-6" style={{ background: `${c.primary}08`, border: `1px solid ${c.primary}22` }}>
          <p className="text-xs tracking-wider uppercase mb-2" style={{ color: c.textMuted }}>{t.tools.preview}</p>
          <SafeHtml className="text-sm leading-relaxed whitespace-pre-line" style={{ color: c.text }} html={previewText.replace(/\n/g, "<br/>")} />
        </div>
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
                {card.isReversed ? t.tools.tarotReversed : t.tools.tarotUpright}
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
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>{(t.dashboard as Record<string,string>)[pillar] || pillar}{t.tools.pillarSuffix}</p>
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
            { label: t.tools.astrologySun, value: `${ed.sunSign} ${ed.sunSymbol}`, sub: ed.element },
            { label: t.tools.astrologyMoon, value: `${ed.moonSign} ${ed.moonSymbol}`, sub: t.tools.astrologyEmotions },
            { label: t.tools.astrologyRising, value: `${ed.risingSign} ${ed.risingSymbol}`, sub: ed.modality },
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

// ===== Render a single content value as readable text =====
function renderContent(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join("\n");
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    return Object.entries(obj)
      .map(([k, v]) => {
        const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
        if (typeof v === "string") return `**${label}:** ${v}`;
        if (Array.isArray(v)) return `**${label}:** ${v.join(", ")}`;
        return `**${label}:** ${JSON.stringify(v)}`;
      })
      .join("\n");
  }
  return String(value);
}

// ===== Full Reading Sections =====
function FullReadingSections({ reading }: { reading: Record<string, unknown> }) {
  const { currentTheme } = useTheme();
  const { t } = useLocale();
  const c = currentTheme.colors;

  if (!reading) return null;

  // Fallback: if reading is a plain string (not an object), render it directly
  if (typeof reading === "string") {
    const text = reading as unknown as string;
    return (
      <div className="rounded-xl p-5 animate-fade-in" style={{ background: `${c.primary}08`, border: `1px solid ${c.primary}15` }}>
        <SafeHtml className="text-sm leading-relaxed whitespace-pre-line" style={{ color: c.text }} html={text.replace(/\n/g, "<br/>")} />
      </div>
    );
  }

  if (typeof reading !== "object") return null;

  const sections: Array<{ title: string; content: string | unknown; isHighlight?: boolean }> = [];

  // Overview
  if (reading.overview) sections.push({ title: t.tools.readingSections.overview, content: renderContent(reading.overview), isHighlight: true });

  // Title (Meditation)
  if (reading.title && typeof reading.title === "string") {
    sections.push({ title: "✨ " + reading.title, content: reading.introduction ? renderContent(reading.introduction) : "", isHighlight: true });
  } else if (reading.introduction) {
    sections.push({ title: t.tools.readingSections.introduction, content: renderContent(reading.introduction) });
  }

  // Day Master (BaZi)
  if (reading.dayMaster) sections.push({ title: t.tools.readingSections.dayMaster, content: renderContent(reading.dayMaster) });

  // Element Analysis (BaZi) — structured instead of JSON
  if (reading.elementAnalysis) {
    const ea = reading.elementAnalysis as Record<string, unknown>;
    if (typeof ea === "object") {
      const parts = Object.entries(ea)
        .map(([k, v]) => {
          const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
          return `**${label}:** ${typeof v === "string" ? v : Array.isArray(v) ? v.join(", ") : JSON.stringify(v)}`;
        })
        .join("\n");
      sections.push({ title: t.tools.readingSections.elementAnalysis, content: parts });
    }
  }

  // Big Three (Astrology)
  if (reading.bigThree) {
    const bt = reading.bigThree as Record<string, unknown>;
    if (typeof bt === "object") {
      if (bt.sun) sections.push({ title: t.tools.readingSections.sunSign, content: renderContent(bt.sun) });
      if (bt.moon) sections.push({ title: t.tools.readingSections.moonSign, content: renderContent(bt.moon) });
      if (bt.rising) sections.push({ title: t.tools.readingSections.risingSign, content: renderContent(bt.rising) });
    }
  }

  // Planetary Influences (Astrology)
  if (reading.planetaryInfluences && Array.isArray(reading.planetaryInfluences)) {
    const pi = reading.planetaryInfluences as Array<{ planet?: string; influence?: string }>;
    const parts = pi.map((p) => `**${p.planet || "Planet"}:** ${p.influence || ""}`).join("\n\n");
    if (parts) sections.push({ title: t.tools.readingSections.planetaryInfluences, content: parts });
  }

  // Current Transits (Astrology)
  if (reading.currentTransits) {
    sections.push({ title: t.tools.readingSections.currentTransits, content: renderContent(reading.currentTransits) });
  }

  // Life Aspects
  if (reading.lifeAspects) {
    const la = reading.lifeAspects as Record<string, unknown>;
    if (typeof la === "object") {
      const sectionTitles = t.tools.readingSections as Record<string, string>;
      const aspectLabels: Record<string, string> = {
        personality: sectionTitles.personality,
        career: sectionTitles.career,
        relationships: sectionTitles.relationships,
        health: sectionTitles.health,
        love: sectionTitles.love,
        growth: sectionTitles.growth,
      };
      Object.entries(la).forEach(([key, value]) => {
        if (value) {
          sections.push({ title: aspectLabels[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()), content: renderContent(value) });
        }
      });
    }
  }

  // Pillars (BaZi) — structured instead of JSON
  if (Array.isArray(reading.pillars)) {
    const pillars = reading.pillars as Array<Record<string, unknown>>;
    const parts = pillars
      .map((p) => {
        const name = p.name || p.pillar || "Pillar";
        const meaning = p.meaning || p.interpretation || "";
        const stem = p.stem || "";
        const branch = p.branch || "";
        let line = `**${name}**`;
        if (stem && branch) line += ` — ${stem}${branch}`;
        if (meaning) line += `\n${meaning}`;
        return line;
      })
      .join("\n\n");
    sections.push({ title: t.tools.readingSections.pillarAnalysis, content: parts });
  }

  // Lucky Elements (BaZi)
  if (Array.isArray(reading.luckyElements)) {
    const le = reading.luckyElements as string[];
    sections.push({ title: t.tools.readingSections.luckyElements, content: le.map((e) => `• ${e}`).join("\n") });
  }

  // Overall Score (Feng Shui)
  if (reading.overallScore) {
    sections.push({ title: t.tools.readingSections.overallScore, content: `${reading.overallScore} / 10`, isHighlight: true });
  }

  // Areas (Feng Shui)
  if (Array.isArray(reading.areas)) {
    const areas = reading.areas as Array<{ name: string; rating?: string; analysis?: string; suggestions?: string[] }>;
    for (const area of areas) {
      if (area.analysis) {
        let content = area.analysis;
        if (area.suggestions && area.suggestions.length > 0) {
          content += "\n\n**Suggestions:**\n" + area.suggestions.map((s) => `• ${s}`).join("\n");
        }
        sections.push({ title: `${area.name}${area.rating ? ` (${area.rating})` : ""}`, content });
      }
    }
  }

  // Elements (Feng Shui)
  if (reading.elements) {
    const el = reading.elements as Record<string, unknown>;
    if (typeof el === "object") {
      const parts = Object.entries(el)
        .map(([k, v]) => `**${k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}:** ${typeof v === "string" ? v : Array.isArray(v) ? v.join(", ") : JSON.stringify(v)}`)
        .join("\n");
      sections.push({ title: t.tools.readingSections.elements, content: parts });
    }
  }

  // Colors (Feng Shui)
  if (reading.colors) {
    const cols = reading.colors as Record<string, unknown>;
    if (Array.isArray(cols.recommended)) {
      sections.push({ title: t.tools.readingSections.recommendedColors, content: (cols.recommended as string[]).join(", ") });
    }
    if (Array.isArray(cols.avoid)) {
      sections.push({ title: t.tools.readingSections.colorsToAvoid, content: (cols.avoid as string[]).join(", ") });
    }
  }

  // Top Improvements (Feng Shui)
  if (Array.isArray(reading.topImprovements)) {
    sections.push({ title: t.tools.readingSections.topImprovements, content: (reading.topImprovements as string[]).map((i, idx) => `${idx + 1}. ${i}`).join("\n") });
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
    const hold = bp.hold ? `Hold ${bp.hold}` : null;
    const parts = [`**${bp.name}**`, `Inhale ${bp.inhale}`];
    if (hold) parts.push(hold);
    parts.push(`Exhale ${bp.exhale}`);
    if (bp.description) parts.push(`\n${bp.description}`);
    sections.push({ title: t.tools.readingSections.breathingPattern, content: parts.join(", ") });
  }

  // Affirmations
  if (Array.isArray(reading.affirmations)) {
    sections.push({
      title: t.tools.readingSections.affirmations,
      content: (reading.affirmations as string[]).map((a) => `• "${a}"`).join("\n"),
    });
  }

  // Single affirmation
  if (reading.affirmation && !Array.isArray(reading.affirmations)) {
    sections.push({ title: t.tools.readingSections.yourAffirmation, content: reading.affirmation as string, isHighlight: true });
  }

  // Tips (Meditation)
  if (Array.isArray(reading.tips)) {
    sections.push({
      title: t.tools.readingSections.tips,
      content: (reading.tips as string[]).map((t) => `• ${t}`).join("\n"),
    });
  }

  // Advice
  if (reading.advice) sections.push({ title: t.tools.readingSections.advice, content: renderContent(reading.advice) });

  // Summary
  if (reading.summary) sections.push({ title: t.tools.readingSections.summary, content: renderContent(reading.summary) });

  // ===== CATCH-ALL: if no sections were extracted, display the whole reading =====
  if (sections.length === 0) {
    // reading might have unknown keys — render them all
    const unknownSections = Object.entries(reading)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([key, value]) => ({
        title: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
        content: renderContent(value),
      }));
    if (unknownSections.length > 0) {
      return (
        <div className="space-y-4">
          {unknownSections.map((section, i) => (
            <div key={i} className="rounded-xl p-5 animate-fade-in" style={{ background: i === 0 ? `${c.primary}08` : c.surface, border: `1px solid ${c.primary}15` }}>
              <h3 className="text-sm font-semibold tracking-wider uppercase mb-3" style={{ color: c.primary }}>{section.title}</h3>
              <SafeHtml className="text-sm leading-relaxed whitespace-pre-line" style={{ color: c.text }} html={(section.content as string).replace(/\n/g, "<br/>")} />
            </div>
          ))}
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div
          key={i}
          className="rounded-xl p-5 animate-fade-in"
          style={{
            background: section.isHighlight
              ? `${c.primary}08`
              : c.surface,
            border: `1px solid ${c.primary}15`,
          }}
        >
          <h3 className="text-sm font-semibold tracking-wider uppercase mb-3" style={{ color: c.primary }}>
            {section.title}
          </h3>
          <SafeHtml
            className="text-sm leading-relaxed whitespace-pre-line"
            style={{ color: c.text }}
            html={(typeof section.content === "string"
              ? section.content
              : JSON.stringify(section.content, null, 2)
            ).replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}
          />
        </div>
      ))}
    </div>
  );
}
