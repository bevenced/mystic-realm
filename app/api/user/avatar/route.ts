import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { updateUserAvatar } from "@/lib/db";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_BYTES = 512_000; // 500KB

const avatarSchema = z.object({
  avatar: z.string().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = avatarSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { avatar } = parsed.data;

    // Removing avatar
    if (avatar === null) {
      await updateUserAvatar(user.id, null);
      return NextResponse.json({ success: true, avatar: null });
    }

    // Uploading new avatar
    if (typeof avatar !== "string" || !avatar.startsWith("data:image/") || !avatar.includes(";base64,")) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    // Validate MIME type
    const mimeMatch = avatar.match(/^data:(image\/\w+);base64,/);
    if (!mimeMatch || !ALLOWED_MIME_TYPES.includes(mimeMatch[1])) {
      return NextResponse.json(
        { error: "Invalid image type. Allowed: JPEG, PNG, GIF, WebP" },
        { status: 400 },
      );
    }

    // Check decoded size
    const base64Payload = avatar.split(";base64,")[1];
    const decodedSize = Math.ceil((base64Payload.length * 3) / 4);
    if (decodedSize > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image too large. Maximum 500KB." },
        { status: 413 },
      );
    }

    await updateUserAvatar(user.id, avatar);

    return NextResponse.json({ success: true, avatar });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Failed to save avatar" }, { status: 500 });
  }
}
