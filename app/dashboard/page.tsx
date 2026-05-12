import { Suspense } from "react";
import DashboardClient from "./DashboardClient";
import Footer from "@/components/ui/Footer";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
  description: "Your mystical dashboard — subscription status, reading history, daily check-in, and points.",
};

export default function DashboardPage() {
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
        <DashboardClient />
      </Suspense>
      <Footer />
    </>
  );
}
