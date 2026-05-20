"use client";

import { useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Star } from "lucide-react";

interface ReviewStarsProps {
  service: string;
  onSubmitted?: () => void;
}

export default function ReviewStars({ service, onSubmitted }: ReviewStarsProps) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, rating, comment: comment.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        onSubmitted?.();
      } else {
        setError(data.error || "Failed to submit review.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="mt-8 rounded-lg p-5 text-center animate-fade-in"
        style={{ background: `${c.primary}08`, border: `1px solid ${c.primary}22` }}
      >
        <p className="text-lg mb-1">🙏</p>
        <p className="text-sm font-semibold" style={{ color: c.text }}>Thank you for your feedback!</p>
        <p className="text-xs mt-1" style={{ color: c.textMuted }}>
          Your review helps others discover their path.
        </p>
      </div>
    );
  }

  return (
    <div
      className="mt-8 rounded-lg p-5 animate-fade-in"
      style={{ background: `${c.primary}05`, border: `1px solid ${c.primary}15` }}
    >
      <p className="text-sm font-semibold text-center mb-3" style={{ color: c.text }}>
        How was your {service} reading?
      </p>

      {/* Stars */}
      <div className="flex items-center justify-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              size={24}
              fill={(hovered || rating) >= star ? c.primary : "none"}
              style={{
                color: (hovered || rating) >= star ? c.primary : c.textMuted,
                transition: "all 0.2s",
              }}
            />
          </button>
        ))}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)..."
        maxLength={500}
        className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-none mb-4"
        style={{
          backgroundColor: `${c.primary}08`,
          border: `1px solid ${c.primary}22`,
          color: c.text,
          minHeight: 70,
        }}
      />

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className="w-full py-2.5 rounded-full text-sm font-semibold transition-all"
        style={{
          backgroundColor: rating > 0 ? c.primary : `${c.primary}30`,
          color: rating > 0 ? (isDark ? c.bg : "#FFFFFF") : c.textMuted,
          cursor: rating > 0 ? "pointer" : "not-allowed",
        }}
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>

      {error && (
        <p className="text-xs text-center mt-2" style={{ color: "#E74C3C" }}>
          {error}
        </p>
      )}
    </div>
  );
}
