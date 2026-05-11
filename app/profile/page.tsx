import { Suspense } from "react";
import ProfileClient from "./ProfileClient";
import Footer from "@/components/ui/Footer";

export const metadata = {
  title: "Profile",
  description: "Set your birth information for personalized daily fortunes and readings.",
};

export default function ProfilePage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading...</div>
          </div>
        }
      >
        <ProfileClient />
      </Suspense>
      <Footer />
    </>
  );
}
