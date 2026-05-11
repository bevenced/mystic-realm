import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return Response.json({ user: null }, { status: 401 });
  }
  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      points: user.points,
      birthDate: user.birth_date,
      birthHour: user.birth_hour,
      gender: user.gender,
    },
  });
}
