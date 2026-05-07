import { Suspense } from "react";
import ShopPageClient from "./ShopPageClient";
import Footer from "@/components/ui/Footer";

export default function ShopPage() {
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
        <ShopPageClient />
      </Suspense>
      <Footer />
    </>
  );
}
