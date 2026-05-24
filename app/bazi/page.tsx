import type { Metadata } from "next";
import BaziClient from "./BaziClient";

export const metadata: Metadata = {
  title: "BaZi Destiny Chart — Free Four Pillars Analysis | OrientWisdom",
  description: "Discover your cosmic blueprint. Enter your birth date and time to receive a free BaZi (Four Pillars of Destiny) chart with AI-powered interpretation. No registration required.",
};

export default function BaZiPage() {
  return <BaziClient />;
}
