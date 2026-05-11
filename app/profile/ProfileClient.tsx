"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles, Save, Loader2 } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  birthDate: string | null;
  birthHour: number | null;
  gender: string;
}

function getAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const [y, m, d] = birthDate.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  const birthdayPassed =
    today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d);
  if (!birthdayPassed) age--;
  return age;
}

export default function ProfileClient() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;
  const { isSignedIn, isLoaded, user: clerkUser } = useUser();

  const [profile, setProfile] = useState<ProfileData>({ name: "", email: "", birthDate: null, birthHour: null, gender: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setProfile(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name || undefined,
          birthDate: profile.birthDate || undefined,
          birthHour: profile.birthHour ?? undefined,
          gender: profile.gender || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "Profile saved successfully" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen">
        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: c.text }}>Sign in to view your profile</h1>
          <Link
            href="/sign-in"
            className="inline-block px-8 py-3 rounded-full text-base font-semibold transition-all"
            style={{ backgroundColor: c.primary, color: isDark ? c.bg : "#FFFFFF" }}
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading profile...</div>
      </div>
    );
  }

  const age = getAge(profile.birthDate);

  return (
    <main className="min-h-screen">
      <div className="relative">
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${c.primary}12 0%, transparent 50%)` }}
        />

        <div className="relative mx-auto max-w-2xl px-6 pt-24 pb-20">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold" style={{ color: c.primary }}>Your Profile</h1>
            <p className="text-sm mt-2" style={{ color: c.textMuted }}>
              Set your birth details for personalized daily fortunes
            </p>
          </div>

          <div
            className="rounded-xl p-6 space-y-5"
            style={{ background: c.surface, border: `1px solid ${c.primary}22` }}
          >
            {/* Name */}
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase mb-1.5 block" style={{ color: c.textMuted }}>
                Display Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder={clerkUser?.firstName || "Your name"}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors"
                style={{
                  background: isDark ? "#1a1a2e" : "#fafafa",
                  color: c.text,
                  borderColor: `${c.primary}22`,
                }}
              />
            </div>

            {/* Birth Date */}
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase mb-1.5 block" style={{ color: c.textMuted }}>
                Birth Date
              </label>
              <input
                type="date"
                value={profile.birthDate || ""}
                onChange={(e) => setProfile({ ...profile, birthDate: e.target.value || null })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors"
                style={{
                  background: isDark ? "#1a1a2e" : "#fafafa",
                  color: c.text,
                  borderColor: `${c.primary}22`,
                }}
              />
              {age !== null && (
                <p className="text-xs mt-1" style={{ color: c.textMuted }}>Age: {age}</p>
              )}
            </div>

            {/* Birth Hour */}
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase mb-1.5 block" style={{ color: c.textMuted }}>
                Birth Hour (0-23)
              </label>
              <select
                value={profile.birthHour ?? ""}
                onChange={(e) => setProfile({ ...profile, birthHour: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors"
                style={{
                  background: isDark ? "#1a1a2e" : "#fafafa",
                  color: c.text,
                  borderColor: `${c.primary}22`,
                }}
              >
                <option value="">Unknown</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}:00 ({i === 0 ? "Midnight" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`})
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase mb-1.5 block" style={{ color: c.textMuted }}>
                Gender
              </label>
              <div className="flex gap-3">
                {[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setProfile({ ...profile, gender: opt.value })}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: profile.gender === opt.value ? c.primary : "transparent",
                      color: profile.gender === opt.value ? (isDark ? c.bg : "#FFFFFF") : c.textMuted,
                      border: `1px solid ${profile.gender === opt.value ? c.primary : `${c.primary}33`}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  backgroundColor: saving ? `${c.primary}30` : c.primary,
                  color: saving ? c.textMuted : isDark ? c.bg : "#FFFFFF",
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: saving ? "none" : `0 0 15px ${currentTheme.glow}`,
                }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving..." : "Save Profile"}
              </button>
              {message && (
                <span
                  className="ml-3 text-xs"
                  style={{ color: message.type === "success" ? "#2ECC71" : "#E74C3C" }}
                >
                  {message.text}
                </span>
              )}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm"
              style={{ color: c.textMuted }}
            >
              <Sparkles size={14} />
              Back to Dashboard — try your personalized check-in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
