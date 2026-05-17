import { Sparkles } from "lucide-react";
import WishClient from "./WishClient";

export const metadata = {
  title: "Daily Wish",
  description: "Make a wish, light a star, and share your heartfelt blessings with loved ones.",
};

export default function WishPage() {
  return (
    <main className="min-h-screen">
      <div className="relative">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, var(--color-primary) 0%, transparent 50%)",
            opacity: 0.08,
          }}
        />
        <div className="relative mx-auto max-w-2xl px-6 pt-24 pb-20">
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>
              <Sparkles size={28} className="inline mr-2" />
              Daily Wish
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
              Light a star for your heart&apos;s desire — 3 wishes per day, 3 points each
            </p>
          </div>
          <WishClient />
        </div>
      </div>
    </main>
  );
}
