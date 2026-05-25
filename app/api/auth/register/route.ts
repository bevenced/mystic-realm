import { NextRequest } from "next/server";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { createUser, getUserByEmail, addUserPoints } from "@/lib/db";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, password, name } = parsed.data;

    // Check if email already exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(email, name, passwordHash);
    if (!user) {
      return Response.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Welcome bonus: +50 points for new users
    const points = await addUserPoints(user.id, 50, "signup_bonus", "Welcome bonus");

    const token = createSessionToken({ id: user.id, email: user.email, name: user.name });
    const cookie = setSessionCookie(token);

    return Response.json(
      { user: { id: user.id, email: user.email, name: user.name, plan: user.plan, points } },
      { status: 201, headers: { "Set-Cookie": cookie } },
    );
  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
