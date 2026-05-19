import { NextResponse } from "next/server";
import { getRecentPublicWishes } from "@/lib/db";

function anonymizeName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] || "Someone";
  return parts[0] + " " + parts[1][0] + ".";
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export async function GET() {
  try {
    const rows = await getRecentPublicWishes();
    const wishes = rows.map((w: any) => ({
      id: w.id,
      category: w.category,
      text: w.wish_text,
      userName: anonymizeName(w.user_name || "Anonymous"),
      timeLabel: timeAgo(new Date(w.created_at)),
    }));
    return NextResponse.json({ wishes });
  } catch {
    return NextResponse.json({ error: "Failed to load wishes" }, { status: 500 });
  }
}
