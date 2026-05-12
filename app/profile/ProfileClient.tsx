"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { Sparkles, Save, Loader2, Camera } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

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
  const { isSignedIn, isLoaded, user: authUser } = useAuth();

  const [profile, setProfile] = useState<ProfileData>({ name: "", email: "", birthDate: null, birthHour: null, gender: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);

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
          birthDate: profile.birthDate ? profile.birthDate.slice(0, 10) : undefined,
          birthHour: profile.birthHour ?? undefined,
          gender: profile.gender || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: "error", text: `Save failed: ${data.error}${data.details ? " — " + JSON.stringify(data.details) : ""}` });
      } else {
        // Update local state from server response so UI reflects saved data immediately
        if (data.birthDate) {
          setProfile((prev) => ({ ...prev, birthDate: data.birthDate }));
        }
        setMessage({ type: "success", text: "Profile saved successfully" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // Avatar upload
  const resizeImage = useCallback((file: File, maxDim: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.8));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      setMessage({ type: "error", text: "Invalid image type. Allowed: JPEG, PNG, GIF, WebP" });
      return;
    }
    if (file.size > 512_000) {
      setMessage({ type: "error", text: "Image too large. Maximum 500KB." });
      return;
    }

    try {
      const dataUrl = await resizeImage(file, 256);
      setAvatarPreview(dataUrl);
      setMessage(null);
    } catch {
      setMessage({ type: "error", text: "Failed to process image" });
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarPreview) return;
    setAvatarSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: avatarPreview }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setAvatarPreview(null);
        await fetch("/api/auth/me")
          .then((r) => r.json())
          .then((d) => {
            if (d.user) {
              // trigger AuthProvider refresh indirectly via window focus
            }
          });
        window.location.reload();
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: null }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setAvatarPreview(null);
        window.location.reload();
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setAvatarSaving(false);
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
            {/* Avatar upload */}
            <div className="flex flex-col items-center mb-2">
              <div
                className="relative group cursor-pointer"
                onClick={() => document.getElementById("avatar-input")?.click()}
              >
                <Avatar
                  src={avatarPreview ?? authUser?.avatar}
                  name={profile.name || authUser?.name}
                  size={96}
                />
                <div
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <input
                id="avatar-input"
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="flex gap-3 mt-2">
                {avatarPreview && (
                  <button
                    onClick={handleSaveAvatar}
                    disabled={avatarSaving}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: c.primary,
                      color: isDark ? c.bg : "#FFFFFF",
                    }}
                  >
                    {avatarSaving ? "Saving..." : "Save Avatar"}
                  </button>
                )}
                {(authUser?.avatar || avatarPreview) && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={avatarSaving}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      border: `1px solid #E74C3C44`,
                      color: "#E74C3C",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase mb-1.5 block" style={{ color: c.textMuted }}>
                Display Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder={authUser?.name || "Your name"}
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
