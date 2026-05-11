"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import DailyCheckin from "@/components/features/DailyCheckin";

export default function HomeCheckinWidget() {
  const { isSignedIn } = useAuth();
  return <DailyCheckin isSignedIn={isSignedIn} />;
}
