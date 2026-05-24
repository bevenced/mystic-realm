"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Tab = "password" | "code";

export default function SignInClient() {
  const [tab, setTab] = useState<Tab>("password");

  // Password form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Code form
  const [codeEmail, setCodeEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const { t } = useLocale();

  const redirect = searchParams.get("redirect_url") || "/dashboard";

  // ── Password login ──

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.common.error);
        return;
      }

      await refreshUser();
      router.push(redirect);
      router.refresh();
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  }

  // ── Send verification code ──

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: codeEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.common.error);
        return;
      }

      setCodeSent(true);
      setError("");
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  }

  // ── Verify code and sign in ──

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.common.error);
        return;
      }

      await refreshUser();
      router.push(redirect);
      router.refresh();
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  }

  // ── Google OAuth ──

  function handleGoogleSignIn() {
    setGoogleLoading(true);
    window.location.href = "/api/auth/google";
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl"
        style={{
          backgroundColor: "var(--color-card-bg)",
          border: "1px solid var(--color-border-tertiary)",
        }}
      >
        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: "var(--color-text)" }}>
          {t.signIn.title}
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: "var(--color-text-muted)" }}>
          {t.signIn.subtitle}
        </p>

        {/* ── Tabs ── */}
        <div className="flex rounded-lg mb-6 p-1" style={{ background: "var(--color-bg)" }}>
          <button
            type="button"
            onClick={() => { setTab("password"); setError(""); }}
            className="flex-1 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              background: tab === "password" ? "var(--color-card-bg)" : "transparent",
              color: tab === "password" ? "var(--color-text)" : "var(--color-text-muted)",
              boxShadow: tab === "password" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {t.signIn.passwordTab}
          </button>
          <button
            type="button"
            onClick={() => { setTab("code"); setError(""); }}
            className="flex-1 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              background: tab === "code" ? "var(--color-card-bg)" : "transparent",
              color: tab === "code" ? "var(--color-text)" : "var(--color-text-muted)",
              boxShadow: tab === "code" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {t.signIn.codeTab}
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div
            className="text-sm p-3 rounded-lg mb-4"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
          >
            {error}
          </div>
        )}

        {/* ── Password Form ── */}
        {tab === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                {t.signIn.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg"
                style={{
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border-tertiary)",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                {t.signIn.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-lg"
                style={{
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border-tertiary)",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-medium"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-bg)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? t.signIn.signingIn : t.signIn.title}
            </button>
          </form>
        )}

        {/* ── Code Form ── */}
        {tab === "code" && (
          <form onSubmit={codeSent ? handleVerifyCode : handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                {t.signIn.email}
              </label>
              <input
                type="email"
                value={codeEmail}
                onChange={(e) => { setCodeEmail(e.target.value); setCodeSent(false); }}
                required
                disabled={codeSent}
                className="w-full px-4 py-2.5 rounded-lg"
                style={{
                  backgroundColor: "var(--color-bg)",
                  color: codeSent ? "var(--color-text-muted)" : "var(--color-text)",
                  border: "1px solid var(--color-border-tertiary)",
                }}
              />
            </div>

            {codeSent && (
              <>
                <p className="text-xs" style={{ color: "#2ECC71" }}>
                  ✓ {t.signIn.codeSent}
                </p>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                    {t.signIn.codePlaceholder}
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    className="w-full px-4 py-2.5 rounded-lg text-center text-2xl tracking-widest font-mono"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-border-tertiary)",
                    }}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-medium"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-bg)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? (codeSent ? t.signIn.verifying : t.signIn.sendingCode)
                : (codeSent ? t.signIn.verifyCode : t.signIn.sendCode)}
            </button>

            <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
              {t.signIn.autoRegisterNotice}
            </p>
          </form>
        )}

        {/* ── Separator ── */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "var(--color-border-tertiary)" }} />
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--color-border-tertiary)" }} />
        </div>

        {/* ── Google Sign-In ── */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
          style={{
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border-tertiary)",
            opacity: googleLoading ? 0.7 : 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googleLoading ? "..." : t.signIn.googleSignIn}
        </button>

        <p className="text-sm text-center mt-6" style={{ color: "var(--color-text-muted)" }}>
          {t.signIn.noAccount}{" "}
          <Link href="/sign-up" style={{ color: "var(--color-primary)" }}>
            {t.signIn.signUp}
          </Link>
        </p>
      </div>
    </div>
  );
}
