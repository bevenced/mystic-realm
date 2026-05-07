export default function Footer() {
  return (
    <footer className="py-10 px-6">
      {/* 渐变分隔线 */}
      <div
        className="h-px mx-auto max-w-4xl mb-8"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-primary)66, transparent)",
        }}
      />

      <div className="mx-auto max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4">
        <p
          className="text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Mystic Realm &copy; {new Date().getFullYear()} &mdash; Ancient wisdom, modern magic.
        </p>

        <div
          className="flex items-center gap-6 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Terms</a>
          <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Contact</a>
        </div>
      </div>

      <p
        className="text-center text-xs mt-6"
        style={{ color: "var(--color-text-muted)", opacity: 0.5 }}
      >
        Powered by Rain and Bevin
      </p>
    </footer>
  );
}
