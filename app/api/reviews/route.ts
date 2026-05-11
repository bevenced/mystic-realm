import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { submitReview } from "@/lib/db";

const reviewSchema = z.object({
  service: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).default(""),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Please sign in to submit a review." }, { status: 401 });
    }

    // Rate limiting: max 5 reviews per user per hour
    const rateResult = await checkRateLimit(`review:${user.id}`, { maxRequests: 5, windowSeconds: 3600 });
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many reviews. Please wait before submitting another." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { service, rating, comment } = parsed.data;

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
