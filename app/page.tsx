import type { Metadata } from "next";
import HeroSection from "@/components/ui/HeroSection";
import CoreFeatures from "@/components/ui/CoreFeatures";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Ancient Wisdom, Modern Magic",
  description:
    "Get AI-powered daily BaZi fortune readings, make wishes, and build your cosmic profile.",
};

export default function HomePage() {
  return (
    <main>
      {/* Section 1: Hero */}
      <HeroSection />

      {/* Section 2: Core Features */}
      <CoreFeatures />

      {/* Section 3: Footer */}
      <Footer />
    </main>
  );
}
