import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const reviewSchema = z.object({
  service: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).default(""),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Please sign in to submit a review." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { service, rating, comment } = parsed.data;

    const { getOrCreateUser, submitReview } = await import("@/lib/db");
    const user = await getOrCreateUser(userId);

    const review = await submitReview({
      userId: user.id,
      service,
      rating,
      comment,
      displayName: user.name || "Anonymous Seeker",
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
