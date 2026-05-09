import { Suspense } from "react";
import ToolsPageClient from "./ToolsPageClient";
import Footer from "@/components/ui/Footer";

export const metadata = {
  title: "AI Mystical Tools",
  description:
    "Get personalized AI-powered tarot readings, BaZi analysis, Feng Shui consultations, natal chart readings, and guided meditations.",
};

export default function ToolsPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Loading...
            </div>
          </div>
        }
      >
        <ToolsPageClient />
      </Suspense>
      <Footer />
    </>
  );
}
