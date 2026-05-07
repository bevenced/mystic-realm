import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";

export async function POST() {
  try {
    const result = await initDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Database init error:", error);
    return NextResponse.json(
      { error: "Failed to initialize database", details: String(error) },
      { status: 500 }
    );
  }
}
