"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Sparkles, ChevronDown, Mail } from "lucide-react";

const CATEGORIES = [
  { value: "health", label: "Health", emoji: "💚" },
  { value: "wealth", label: "Wealth", emoji: "💰" },
  { value: "luck", label: "Luck", emoji: "🍀" },
  { value: "friendship", label: "Friendship", emoji: "🤝" },
  { value: "love", label: "Love", emoji: "❤️" },
] as const;

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

const WISH_EXAMPLES: Record<string, string> = {
  health: `"Wishing my mother a speedy recovery from her surgery."`,
  wealth: `"May my business bring prosperity and growth this year."`,
  luck: `"Hoping for good luck on my upcoming job interview."`,
  friendship: `"Wishing my best friend happiness in their new journey."`,
  love: `"May my relationship grow deeper with love and understanding."`,
};

export default function DailyWish({ isSignedIn }: { isSignedIn: boolean }) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const { user } = useAuth();

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
      setError("Failed to create wish. Please try again.");
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
          ✨ Today&apos;s Wish
        </h3>
        {data && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: remaining > 0 ? `${c.primary}12` : `${c.primary}06`,
              color: remaining > 0 ? c.primary : c.textMuted,
            }}
          >
            {Math.max(0, remaining)} left
          </span>
        )}
      </div>

      {!data ? (
        <div className="text-xs" style={{ color: c.textMuted }}>Loading...</div>
      ) : !data.checkedInToday ? (
        <p className="text-xs leading-relaxed" style={{ color: c.textMuted }}>
          🌙 Check in first to make a wish today.
        </p>
      ) : remaining <= 0 ? (
        <p className="text-xs leading-relaxed" style={{ color: c.textMuted }}>
          ✨ You&apos;ve made all {data.maxWishes} wishes for today. Come back tomorrow!
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
              <option value="" disabled>Choose a category...</option>
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
                    ? `Write your ${cat.label.toLowerCase()} wish here...\ne.g. ${WISH_EXAMPLES[cat.value]}`
                    : "Write your wish here..."
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
                placeholder="Recipient's email (optional)"
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
                    Blessing...
                  </span>
                ) : (
                  <span>✨ Make a Wish (-{data?.pointCost || 3} pts)</span>
                )}
              </button>
            </>
          )}

          {!category && (
            <p className="text-xs" style={{ color: c.textMuted }}>
              ↑ Select a category above to start writing your wish.
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
            Today&apos;s Wishes
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
                        ✓ Email sent to {wish.recipient_email} +5 pts
                      </span>
                    ) : (
                      <a
                        href={`mailto:${wish.recipient_email}?subject=${encodeURIComponent(`You've received a blessing from ${user?.name || "Someone"}`)}&body=${encodeURIComponent(`✨ A wish for you from ${user?.name || "Someone"} at Orient Wisdom:\n\n${wish.wish_text}\n\n—— Sent with ❤️ via Orient Wisdom`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1.5 ml-6 text-[10px] font-medium hover:underline"
                        style={{ color: c.primary }}
                      >
                        <Mail size={10} />
                        Notify {wish.recipient_email}
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
            ? `You have ${data.userPoints} pts — each wish costs ${data.pointCost || 3} pts`
            : `Need ${data.pointCost || 3} pts to make a wish`}
        </p>
      )}
    </div>
  );
}
