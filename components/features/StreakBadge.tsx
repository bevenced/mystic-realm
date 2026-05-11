"use client";

import { useState, useEffect } from "react";
import { Flame } from "lucide-react";

export default function StreakBadge({ isSignedIn }: { isSignedIn: boolean }) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/checkin")
      .then((r) => r.json())
      .then((d) => {
        if (d.today?.streak) setStreak(d.today.streak);
      })
      .catch(() => {});
  }, [isSignedIn]);

  if (!isSignedIn || streak < 2) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: "#FF6B3520", color: "#FF6B35" }}
    >
      <Flame size={12} />
      {streak}
    </span>
  );
}
