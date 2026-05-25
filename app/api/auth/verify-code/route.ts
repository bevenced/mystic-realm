import { NextRequest, NextResponse } from "next/server";
import { verifyOTPToken, getOTPTokenFromRequest, clearOTPCookie, createSessionToken, setSessionCookie } from "@/lib/auth";
import { getUserByEmail, addUserPoints } from "@/lib/db";
import { sql } from "@/lib/sql";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    const otpToken = getOTPTokenFromRequest(request);
    if (!otpToken) {
      return NextResponse.json({ error: "No verification code requested. Please request a new code." }, { status: 400 });
    }

    const payload = verifyOTPToken(otpToken);
    if (!payload || payload.code !== code) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    const email = payload.email;
    let user = await getUserByEmail(email);

    let isNewUser = false;

    // Auto-register if user doesn't exist
    if (!user) {
      const id = crypto.randomUUID();
      const result = await sql`
        INSERT INTO users (id, clerk_id, email)
        VALUES (${id}, ${id}, ${email})
        RETURNING id, email, name, plan, points, created_at
      `;
      user = result.rows[0];
      isNewUser = true;

      // Welcome bonus: +50 points for new users
      await addUserPoints(user.id, 50, "signup_bonus", "Welcome bonus");
    }

    const sessionToken = createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name || email,
    });

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      isNewUser: !user.name,
    });

    res.headers.append("Set-Cookie", setSessionCookie(sessionToken));
    res.headers.append("Set-Cookie", clearOTPCookie());
    return res;
  } catch (error) {
    console.error("verify-code error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
