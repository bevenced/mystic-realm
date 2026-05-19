import { Suspense } from "react";
import DailyFortuneClient from "./DailyFortuneClient";
import Footer from "@/components/ui/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daily Fortune",
  description: "Generate your personalized AI-powered daily fortune card based on your unique BaZi chart.",
};

export default function DailyFortunePage() {
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
        <DailyFortuneClient />
      </Suspense>
      <Footer />
    </>
  );
}
