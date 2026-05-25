import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { getTodayCheckin, createWish, getTodayWishes, getTodayWishCount, getUserPoints, redeemPoints } from "@/lib/db";
import { sendWishEmail } from "@/lib/mail";

const wishCategories = ["health", "wealth", "luck", "friendship", "love"] as const;

const wishSchema = z.object({
  category: z.enum(wishCategories),
  wishText: z.string().min(1).max(300),
  recipientEmail: z.string().email().optional().or(z.literal("")),
});

const MAX_WISHES_PER_DAY = 3;
const WISH_POINTS_COST = 5;

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const [wishes, wishCount, points, todayCheckin] = await Promise.all([
      getTodayWishes(user.id),
      getTodayWishCount(user.id),
      getUserPoints(user.id),
      getTodayCheckin(user.id),
    ]);

    return NextResponse.json({
      wishes,
      wishCount,
      userPoints: points,
      checkedInToday: !!todayCheckin,
      maxWishes: MAX_WISHES_PER_DAY,
      pointCost: WISH_POINTS_COST,
    });
  } catch (error) {
    console.error("Wish GET error:", error);
    return NextResponse.json({ error: "Failed to load wishes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = wishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { category, wishText, recipientEmail } = parsed.data;

    // Check if user has checked in today
    const todayCheckin = await getTodayCheckin(user.id);
    if (!todayCheckin) {
      return NextResponse.json(
        { error: "Please check in first before making a wish." },
        { status: 400 },
      );
    }

    // Check daily limit
    const wishCount = await getTodayWishCount(user.id);
    if (wishCount >= MAX_WISHES_PER_DAY) {
      return NextResponse.json(
        { error: "Maximum wishes reached for today." },
        { status: 400 },
      );
    }

    // Deduct points (redeemPoints atomically checks balance)
    let newPoints: number;
    try {
      newPoints = await redeemPoints(user.id, WISH_POINTS_COST, `Wish: ${category}`);
    } catch {
      return NextResponse.json(
        { error: `Insufficient points. Each wish costs ${WISH_POINTS_COST} points.` },
        { status: 400 },
      );
    }

    // Create wish
    const wish = await createWish(user.id, category, wishText, recipientEmail || undefined);

    // Send email if recipient provided
    let emailSent = false;
    if (recipientEmail && recipientEmail.trim()) {
      try {
        await sendWishEmail({
          to: recipientEmail.trim(),
          fromName: user.name || user.email || "Someone",
          wishText,
          category,
        });
        emailSent = true;
      } catch (err) {
        console.error("Failed to send wish email:", err);
      }
    }

    // Get updated wishes
    const wishes = await getTodayWishes(user.id);
    const newWishCount = await getTodayWishCount(user.id);

    return NextResponse.json({
      success: true,
      wish,
      wishes,
      wishCount: newWishCount,
      userPoints: newPoints,
      remainingWishes: MAX_WISHES_PER_DAY - newWishCount,
      pointCost: WISH_POINTS_COST,
      emailSent,
    });
  } catch (error) {
    console.error("Wish POST error:", error);
    return NextResponse.json({ error: "Failed to create wish" }, { status: 500 });
  }
}
