import { Suspense } from "react";
import BlogPageClient from "./BlogPageClient";
import Footer from "@/components/ui/Footer";

export default function BlogPage() {
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
        <BlogPageClient />
      </Suspense>
      <Footer />
    </>
  );
}
