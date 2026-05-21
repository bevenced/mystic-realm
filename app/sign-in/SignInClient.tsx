"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function SignInClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const { t } = useLocale();

  async function handleSubmit(e: React.FormEvent) {
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
      router.push(searchParams.get("redirect_url") || "/dashboard");
      router.refresh();
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
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

        {error && (
          <div
            className="text-sm p-3 rounded-lg mb-4"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
