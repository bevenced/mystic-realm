"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { Sparkles, ChevronDown, Mail } from "lucide-react";

interface WishItem {
  id: string;
  category: string;
  wish_text: string;
  recipient_email: string | null;
  created_at: string;
}

interface WishData {
  wishes: WishItem[];
  wishCount: number;
  userPoints: number;
  checkedInToday: boolean;
  maxWishes: number;
  pointCost: number;
}

export default function DailyWish({ isSignedIn }: { isSignedIn: boolean }) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const { user } = useAuth();
  const { t, tf } = useLocale();

  const CATEGORIES = [
    { value: "health", label: t.wish.categories.health, emoji: "💚" },
    { value: "wealth", label: t.wish.categories.wealth, emoji: "💰" },
    { value: "luck", label: t.wish.categories.luck, emoji: "🍀" },
    { value: "friendship", label: t.wish.categories.friendship, emoji: "🤝" },
    { value: "love", label: t.wish.categories.love, emoji: "❤️" },
  ] as const;

  const WISH_EXAMPLES: Record<string, string> = {
    health: t.wish.wishExamples.health,
    wealth: t.wish.wishExamples.wealth,
    luck: t.wish.wishExamples.luck,
    friendship: t.wish.wishExamples.friendship,
    love: t.wish.wishExamples.love,
  };

  const [data, setData] = useState<WishData | null>(null);
  const [category, setCategory] = useState<string>("");
  const [wishText, setWishText] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastEmailSent, setLastEmailSent] = useState<string | null>(null);

  const fetchWishes = useCallback(async () => {
    try {
      const res = await fetch("/api/wish");
      const json = await res.json();
      if (!json.error) setData(json);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) fetchWishes();
  }, [isSignedIn, fetchWishes]);

  const handleSubmit = async () => {
    if (!category || !wishText.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, wishText: wishText.trim(), recipientEmail: recipientEmail.trim() || undefined }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setData({
          wishes: json.wishes,
          wishCount: json.wishCount,
          userPoints: json.userPoints,
          checkedInToday: true,
          maxWishes: data?.maxWishes || 3,
          pointCost: json.pointCost || data?.pointCost || 3,
        });
        if (json.emailSent) {
          setLastEmailSent(recipientEmail.trim() || null);
          setTimeout(() => setLastEmailSent(null), 5000);
        }
        setWishText("");
        setRecipientEmail("");
        setCategory("");
      }
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const remaining = data ? data.maxWishes - data.wishCount : 0;
  const cat = CATEGORIES.find((x) => x.value === category);

  if (!isSignedIn) return null;

  return (
    <div
      className="rounded-lg p-7 animate-fade-in"
      style={{ background: c.surface, border: `1px solid ${c.primary}22` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wider uppercase" style={{ color: c.primary }}>
          ✨ {t.wish.title}
        </h3>
        {data && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: remaining > 0 ? `${c.primary}12` : `${c.primary}06`,
              color: remaining > 0 ? c.primary : c.textMuted,
            }}
          >
            {tf("wish.wishesLeft", { n: Math.max(0, remaining) })}
          </span>
        )}
      </div>

      {!data ? (
        <div className="text-xs" style={{ color: c.textMuted }}>{t.common.loading}</div>
      ) : !data.checkedInToday ? (
        <p className="text-xs leading-relaxed" style={{ color: c.textMuted }}>
          🌙 {t.wish.checkInFirst}
        </p>
      ) : remaining <= 0 ? (
        <p className="text-xs leading-relaxed" style={{ color: c.textMuted }}>
          ✨ {tf("wish.maxWishesReached", { n: data.maxWishes })}
        </p>
      ) : (
        <>
          {/* Category selector */}
          <div className="relative mb-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 rounded-lg text-sm cursor-pointer"
              style={{
                backgroundColor: c.primary + "08",
                color: category ? c.text : c.textMuted,
                border: `1px solid ${c.primary}15`,
              }}
            >
              <option value="" disabled>{t.wish.chooseCategory}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: c.textMuted }}
            />
          </div>

          {category && (
            <>
              {/* Textarea */}
              <textarea
                value={wishText}
                onChange={(e) => setWishText(e.target.value.slice(0, 300))}
                placeholder={
                  cat
                    ? `${tf("wish.wishPlaceholder", { category: cat.label })}\n${WISH_EXAMPLES[cat.value]}`
                    : t.wish.wishPlaceholder
                }
                rows={3}
                maxLength={300}
                className="w-full px-3 py-2.5 rounded-lg text-sm resize-none"
                style={{
                  backgroundColor: c.primary + "06",
                  color: c.text,
                  border: `1px solid ${c.primary}15`,
                }}
              />
              <div className="flex justify-end mb-3">
                <span
                  className="text-[10px]"
                  style={{
                    color: wishText.length >= 280 ? "#E74C3C" : c.textMuted,
                  }}
                >
                  {wishText.length}/300
                </span>
              </div>

              {/* Email input */}
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder={t.wish.recipientEmail}
                className="w-full px-3 py-2.5 rounded-lg text-sm mb-4"
                style={{
                  backgroundColor: c.primary + "06",
                  color: c.text,
                  border: `1px solid ${c.primary}15`,
                }}
              />

              {error && (
                <p className="text-xs mb-3" style={{ color: "#E74C3C" }}>
                  {error}
                </p>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={loading || !wishText.trim()}
                className="w-full py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  backgroundColor: wishText.trim() && !loading ? c.primary : `${c.primary}30`,
                  color: wishText.trim() && !loading ? (currentTheme.isDark ? c.bg : "#FFFFFF") : c.textMuted,
                  cursor: wishText.trim() && !loading ? "pointer" : "not-allowed",
                  opacity: wishText.trim() && !loading ? 1 : 0.6,
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: `${currentTheme.isDark ? c.bg : "#FFFFFF"}40`, borderTopColor: currentTheme.isDark ? c.bg : "#FFFFFF" }} />
                    {t.wish.blessing}
                  </span>
                ) : (
                  <span>✨ {t.wish.makeWish} (-{data?.pointCost || 3} {t.dailyFortune.pts})</span>
                )}
              </button>
            </>
          )}

          {!category && (
            <p className="text-xs" style={{ color: c.textMuted }}>
              ↑ {t.wish.selectCategoryHint}
            </p>
          )}
        </>
      )}

      {/* Today's wishes list */}
      {data && data.wishes.length > 0 && (
        <div className="mt-5">
          <div
            className="text-[10px] font-semibold uppercase tracking-wider mb-3"
            style={{ color: c.textMuted }}
          >
            {t.wish.todayWishes}
          </div>
          <div className="space-y-2">
            {data.wishes.map((wish) => {
              const catInfo = CATEGORIES.find((x) => x.value === wish.category);
              return (
                <div
                  key={wish.id}
                  className="rounded-lg px-3 py-2 text-xs animate-fade-in"
                  style={{
                    background: `${c.primary}06`,
                    border: `1px solid ${c.primary}08`,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 mt-0.5">
                      {catInfo?.emoji || "✨"}
                    </span>
                    <p className="flex-1 leading-relaxed" style={{ color: c.text }}>
                      {wish.wish_text}
                    </p>
                  </div>
                  {wish.recipient_email && (
                    lastEmailSent === wish.recipient_email ? (
                      <span className="inline-flex items-center gap-1 mt-1.5 ml-6 text-[10px] font-medium" style={{ color: "#2ECC71" }}>
                        ✓ {tf("wish.emailSent", { email: wish.recipient_email })}
                      </span>
                    ) : (
                      <a
                        href={`mailto:${wish.recipient_email}?subject=${encodeURIComponent(tf("wish.emailSubjectExternal", { name: user?.name || t.common.avatar }))}&body=${encodeURIComponent(tf("wish.emailBodyExternal", { name: user?.name || t.common.avatar, text: wish.wish_text }))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1.5 ml-6 text-[10px] font-medium hover:underline"
                        style={{ color: c.primary }}
                      >
                        <Mail size={10} />
                        {tf("wish.notifyEmail", { email: wish.recipient_email })}
                      </a>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Points reminder */}
      {data && data.checkedInToday && remaining > 0 && !data.wishes.length && (
        <p className="text-[10px] mt-4 text-center" style={{ color: c.textMuted }}>
          {data.userPoints >= (data.pointCost || 3)
            ? tf("dailyFortune.costPerWish", { points: data.userPoints, cost: data.pointCost || 3 })
            : tf("dailyFortune.needPts", { cost: data.pointCost || 3 })}
        </p>
      )}
    </div>
  );
}
