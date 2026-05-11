"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Sparkles, CheckCircle, Loader2, Flame, UserCircle } from "lucide-react";
import Link from "next/link";

interface CheckinData {
  checkedIn: boolean;
  today: {
    streak: number;
    pointsEarned: number;
    fortune: string;
  } | null;
  totalPoints: number;
}

export default function DailyCheckin({ isSignedIn, initialData }: { isSignedIn: boolean; initialData?: CheckinData | null }) {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;

  const [data, setData] = useState<CheckinData | null>(initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStatus = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/checkin", { signal });
      const json = await res.json();
      if (!json.error) setData(json);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    // Skip fetch if data was provided via props (e.g., from dashboard)
    if (initialData) return;
    const controller = new AbortController();
    fetchStatus(controller.signal);
    return () => controller.abort();
  }, [isSignedIn, fetchStatus, initialData]);

  const handleCheckin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkin", { method: "POST" });
      const json = await res.json();
      if (json.error) {
        if (json.code === "PROFILE_REQUIRED") {
          setError(json.code);
        } else {
          setError(json.details ? `${json.error} (${json.details})` : json.error);
        }
      } else {
        setData({
          checkedIn: true,
          today: {
            streak: json.streak,
            pointsEarned: json.pointsEarned,
            fortune: json.fortune,
          },
          totalPoints: json.totalPoints,
        });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) return null;

  return (
    <div
      className="rounded-xl p-6 animate-fade-in"
      style={{
        background: c.surface,
        border: `1px solid ${c.primary}22`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame size={18} style={{ color: data?.checkedIn && data.today ? "#FF6B35" : c.textMuted }} />
          <h3 className="text-sm font-semibold tracking-wider uppercase" style={{ color: c.text }}>
            Daily Fortune
          </h3>
        </div>
        {data?.today && (
          <span className="text-xs font-semibold" style={{ color: "#FF6B35" }}>
            {data.today.streak} day streak
          </span>
        )}
      </div>

      {/* Not checked in yet */}
      {!data?.checkedIn && (
        <div className="text-center">
          {error === "PROFILE_REQUIRED" ? (
            <div>
              <p className="text-sm mb-3" style={{ color: c.textMuted }}>
                Complete your birth profile to receive personalized daily fortunes based on your BaZi chart.
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  backgroundColor: c.primary,
                  color: isDark ? c.bg : "#FFFFFF",
                  boxShadow: `0 0 15px ${currentTheme.glow}`,
                }}
              >
                <UserCircle size={16} />
                Set Up Profile
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm mb-4" style={{ color: c.textMuted }}>
                Check in to receive your daily fortune and earn points
              </p>
              <button
                onClick={handleCheckin}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  backgroundColor: loading ? `${c.primary}30` : c.primary,
                  color: loading ? c.textMuted : isDark ? c.bg : "#FFFFFF",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : `0 0 15px ${currentTheme.glow}`,
                }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {loading ? "Consulting the stars..." : "Check In"}
              </button>
              {error && error !== "PROFILE_REQUIRED" && (
                <p className="text-xs mt-2" style={{ color: "#E74C3C" }}>
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Already checked in — show fortune */}
      {data?.checkedIn && data.today && (
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle size={16} style={{ color: "#2ECC71", marginTop: 2 }} />
            <div>
              <p className="text-sm leading-relaxed italic" style={{ color: c.text }}>
                &ldquo;{data.today.fortune}&rdquo;
              </p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs" style={{ color: c.textMuted }}>
                  +{data.today.pointsEarned} pts
                </span>
                <span className="text-xs" style={{ color: c.textMuted }}>
                  {data.today.streak} day streak
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Points total */}
      {data && (
        <div
          className="mt-4 pt-3 flex justify-between items-center"
          style={{ borderTop: `1px solid ${c.primary}15` }}
        >
          <span className="text-xs" style={{ color: c.textMuted }}>
            Points balance
          </span>
          <span className="text-sm font-bold" style={{ color: c.primary }}>
            {data.totalPoints} pts
          </span>
        </div>
      )}
    </div>
  );
}
