import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <p
          className="text-8xl font-bold mb-4"
          style={{ color: "var(--color-primary)", opacity: 0.6 }}
        >
          404
        </p>
        <h1
          className="text-2xl font-semibold mb-3"
          style={{ color: "var(--color-text)" }}
        >
          This realm does not exist
        </h1>
        <p
          className="text-sm mb-8 max-w-md mx-auto"
          style={{ color: "var(--color-text-muted)" }}
        >
          The path you seek has vanished into the cosmic void. Return to familiar ground.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-full text-base font-semibold transition-all"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-bg)",
          }}
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
