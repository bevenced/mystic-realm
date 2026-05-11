"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Sparkles, Check, Infinity, History, FileText, Headphones } from "lucide-react";
import PayPalButton from "@/components/features/PayPalButton";
import Link from "next/link";

interface SubStatus {
  plan: string;
  planName: string;
  isActive: boolean;
  expiresAt: string | null;
  features: string[];
  readingsLimit: number;
  readingsThisMonth: number;
}

const MYSTIC_PRICE = 9.99;
const MYSTIC_FEATURES = [
  { icon: Infinity, text: "Unlimited AI readings — tarot, BaZi, astrology, feng shui, meditation" },
  { icon: FileText, text: "Full detailed interpretations (not just previews)" },
  { icon: History, text: "Reading history — revisit past readings anytime" },
  { icon: FileText, text: "Export readings as PDF" },
  { icon: Headphones, text: "Priority access to new features" },
];

export default function MembershipClient() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;
  const { isSignedIn } = useAuth();

  const [subStatus, setSubStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    fetch("/api/subscriptions/status")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setSubStatus(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  const handleSubscribeSuccess = async (orderId: string) => {
    setError("");
    try {
      const res = await fetch("/api/subscriptions/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, planId: "mystic" }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSubStatus({
          plan: "mystic",
          planName: "Mystic",
          isActive: true,
          expiresAt: data.expiresAt,
          features: MYSTIC_FEATURES.map((f) => f.text),
          readingsLimit: 999,
          readingsThisMonth: 0,
        });
      }
    } catch {
      setError("Failed to activate subscription. Please contact support.");
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <main className="min-h-screen">
      <div className="relative">
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${c.primary}12 0%, transparent 50%)` }}
        />

        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-20">
          {/* Header */}
          <div className="text-center mb-14 animate-fade-in">
            <div className="w-12 h-px mx-auto mb-6" style={{ background: c.primary }} />
            <div className="flex items-center justify-center gap-3 mb-3">
              <Sparkles size={24} style={{ color: c.primary }} />
              <h1 className="text-3xl md:text-4xl font-bold tracking-wider" style={{ color: c.primary }}>
                Mystic Membership
              </h1>
              <Sparkles size={24} style={{ color: c.primary }} />
            </div>
            <p className="text-sm max-w-md mx-auto" style={{ color: c.textMuted }}>
              One monthly pass. Unlimited mystical guidance. Your personal oracle, always available.
            </p>
          </div>

          {/* Already subscribed */}
          {subStatus?.isActive && (
            <div className="animate-fade-in max-w-lg mx-auto mb-8">
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: `${c.primary}08`, border: `1px solid ${c.primary}33` }}
              >
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-3"
                  style={{ background: "#2ECC9915", color: "#2ECC99" }}
                >
                  <Check size={14} /> Active
                </div>
                <h2 className="text-lg font-bold mb-1" style={{ color: c.text }}>You're a Mystic Member</h2>
                <p className="text-sm" style={{ color: c.textMuted }}>
                  Unlimited readings until {formatDate(subStatus.expiresAt)}
                </p>
                <p className="text-xs mt-2" style={{ color: c.textMuted }}>
                  Readings this month: {subStatus.readingsThisMonth}
                </p>
              </div>
              <div className="text-center mt-6">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-base font-semibold transition-all"
                  style={{
                    backgroundColor: c.primary,
                    color: isDark ? c.bg : "#FFFFFF",
                    boxShadow: `0 0 20px ${currentTheme.glow}`,
                  }}
                >
                  <Sparkles size={18} />
                  Start a Reading
                </Link>
              </div>
            </div>
          )}

          {/* Plan cards */}
          {!subStatus?.isActive && (
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto animate-fade-in">
              {/* Free */}
              <div
                className="rounded-xl p-6"
                style={{ background: c.surface, border: `1px solid ${c.primary}22` }}
              >
                <h3 className="text-lg font-bold mb-1" style={{ color: c.text }}>Free</h3>
                <p className="text-3xl font-bold mb-4" style={{ color: c.primary }}>$0</p>
                <ul className="space-y-2">
                  {["3 free previews per service", "Basic AI guidance"].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: c.textMuted }}>
                      <Check size={14} style={{ color: c.primary, marginTop: 3, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 text-center">
                  <span className="text-xs" style={{ color: c.textMuted }}>
                    Always free — no sign-up needed
                  </span>
                </div>
              </div>

              {/* Mystic */}
              <div
                className="rounded-xl p-6 relative"
                style={{
                  background: `linear-gradient(135deg, ${c.primary}15 0%, ${c.surface} 100%)`,
                  border: `2px solid ${c.primary}44`,
                }}
              >
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
                  style={{ background: c.primary, color: isDark ? c.bg : "#FFFFFF" }}
                >
                  Most Popular
                </div>
                <h3 className="text-lg font-bold mb-1 mt-2" style={{ color: c.text }}>Mystic</h3>
                <p className="text-3xl font-bold mb-1" style={{ color: c.primary }}>
                  $9.99<span className="text-sm font-normal" style={{ color: c.textMuted }}>/month</span>
                </p>
                <p className="text-xs mb-4" style={{ color: c.textMuted }}>Cancel anytime</p>
                <ul className="space-y-2 mb-6">
                  {MYSTIC_FEATURES.map((f) => (
                    <li key={f.text} className="flex items-start gap-2 text-sm" style={{ color: c.text }}>
                      <f.icon size={14} style={{ color: c.primary, marginTop: 3, flexShrink: 0 }} />
                      {f.text}
                    </li>
                  ))}
                </ul>
                {isSignedIn ? (
                  <PayPalButton
                    amount={MYSTIC_PRICE}
                    spreadKey="mystic"
                    readingId={crypto.randomUUID()}
                    onSuccess={handleSubscribeSuccess}
                    onError={setError}
                  />
                ) : (
                  <div className="text-center">
                    <Link
                      href="/sign-up"
                      className="inline-block w-full text-center py-3 rounded-full text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: c.primary,
                        color: isDark ? c.bg : "#FFFFFF",
                        boxShadow: `0 0 20px ${currentTheme.glow}`,
                      }}
                    >
                      Sign Up to Subscribe
                    </Link>
                  </div>
                )}
                {error && (
                  <p className="text-xs mt-2 text-center" style={{ color: "#E74C3C" }}>
                    {error}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Not signed in and not subscribed */}
          {!isSignedIn && (
            <div className="text-center mt-10 animate-fade-in">
              <p className="text-sm mb-4" style={{ color: c.textMuted }}>
                Sign in to manage your membership or check your subscription status.
              </p>
              <Link
                href="/sign-in"
                className="inline-block px-8 py-3 rounded-full text-base font-semibold transition-all"
                style={{
                  backgroundColor: c.primary,
                  color: isDark ? c.bg : "#FFFFFF",
                  boxShadow: `0 0 20px ${currentTheme.glow}`,
                }}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
