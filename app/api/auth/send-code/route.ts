import { NextRequest, NextResponse } from "next/server";
import { generateOTP, createOTPToken, setOTPCookie } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mail";
import { checkRateLimitDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Rate limit: 3 codes per email per 5 minutes
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rate = await checkRateLimitDb(`send-code:${ip}`, 3, 300);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const code = generateOTP();
    const token = createOTPToken(email.toLowerCase(), code);

    // Send email (fails gracefully if SMTP not configured)
    try {
      await sendVerificationEmail(email.toLowerCase(), code);
    } catch (e) {
      console.error("Failed to send verification email:", e);
      return NextResponse.json({
        error: "Failed to send email. Please ensure SMTP is configured.",
      }, { status: 500 });
    }

    const res = NextResponse.json({ success: true });
    res.headers.append("Set-Cookie", setOTPCookie(token));
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
