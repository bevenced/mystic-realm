import { NextRequest } from "next/server";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.password_hash) {
      return Response.json(
        { error: "This account was created via another method. Please reset your password." },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = createSessionToken({ id: user.id, email: user.email, name: user.name });
    const cookie = setSessionCookie(token);

    return Response.json(
      { user: { id: user.id, email: user.email, name: user.name, plan: user.plan, points: user.points } },
      { headers: { "Set-Cookie": cookie } },
    );
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
