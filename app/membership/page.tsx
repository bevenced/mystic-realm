import { Suspense } from "react";
import MembershipClient from "./MembershipClient";
import Footer from "@/components/ui/Footer";

export const metadata = {
  title: "Membership",
  description: "Unlock unlimited AI mystical readings for $9.99/month. Get full tarot, BaZi, astrology, feng shui, and meditation readings.",
};

export default function MembershipPage() {
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
        <MembershipClient />
      </Suspense>
      <Footer />
    </>
  );
}
