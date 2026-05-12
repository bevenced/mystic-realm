import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { updateUserProfile } from "@/lib/db";
import { sql } from "@/lib/sql";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    // Normalize Date → YYYY-MM-DD string so Zod regex passes on re-save
    const fmtDate = (d: Date | string | null) => {
      if (!d) return null;
      if (d instanceof Date) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      }
      return String(d).slice(0, 10);
    };

    const birthDate = fmtDate(user.birth_date);
    console.log("Profile GET user.id:", user.id, "birth_date raw:", user.birth_date, "formatted:", birthDate);

    return NextResponse.json({
      name: user.name || "",
      email: user.email || "",
      avatar: user.avatar || null,
      birthDate,
      birthHour: user.birth_hour ?? null,
      gender: user.gender || "",
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

const profileSchema = z.object({
  name: z.string().max(100).optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/)
    .transform((d) => d.slice(0, 10))
    .optional(),
  birthHour: z.number().int().min(0).max(23).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("Profile POST body:", JSON.stringify(body));

    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      console.log("Profile POST validation error:", parsed.error.flatten());
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

    console.log("Profile POST parsed data:", JSON.stringify(parsed.data), "user.id:", user.id);

    // Safety: ensure profile columns exist (idempotent — safe to run every time)
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_hour INTEGER`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10)`;

    const updated = await updateUserProfile(user.id, parsed.data);

    // Normalize Date → YYYY-MM-DD so frontend date input shows correctly
    const fmtDate = (d: Date | string | null) => {
      if (!d) return null;
      if (d instanceof Date) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      }
      return String(d).slice(0, 10);
    };
    const birthDate = fmtDate(updated?.birth_date as Date | string | null);
    console.log("Profile POST update result birth_date:", updated?.birth_date, "formatted:", birthDate);

    return NextResponse.json({ success: true, birthDate });
  } catch (error) {
    console.error("Profile POST error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
