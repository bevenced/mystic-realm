"use client";

import { useUser } from "@clerk/nextjs";
import DailyCheckin from "@/components/features/DailyCheckin";

export default function HomeCheckinWidget() {
  const { isSignedIn } = useUser();
  return <DailyCheckin isSignedIn={isSignedIn ?? false} />;
}
