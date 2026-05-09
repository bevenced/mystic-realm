"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <p
          className="text-6xl mb-4"
          style={{ color: "var(--color-primary)", opacity: 0.5 }}
        >
          &#x2639;
        </p>
        <h1
          className="text-2xl font-semibold mb-3"
          style={{ color: "var(--color-text)" }}
        >
          Something went wrong
        </h1>
        <p
          className="text-sm mb-8 max-w-md mx-auto"
          style={{ color: "var(--color-text-muted)" }}
        >
          An unexpected cosmic disturbance occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-block px-8 py-3 rounded-full text-base font-semibold transition-all"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-bg)",
          }}
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
