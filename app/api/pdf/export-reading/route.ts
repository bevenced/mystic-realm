import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { type, date, birthDate, birthHour, gender, content, baziData } = body;

    if (!type || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Dynamic import for pdf-lib (avoids bundling in client)
    const { generateReadingPdf } = await import("@/lib/pdf/generate-reading-pdf");

    const pdfBytes = await generateReadingPdf({
      type,
      date: date || new Date().toISOString().split("T")[0],
      birthDate,
      birthHour,
      gender,
      content,
      baziData,
    });

    // Save to reading_reports table
    try {
      const { sql } = await import("@/lib/sql");
      await sql`
        INSERT INTO reading_reports (id, user_id, reading_type, pdf_size)
        VALUES (gen_random_uuid(), ${authUser.id}, ${type}, ${pdfBytes.length})
      `;
    } catch {}

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="orient-wisdom-${type}-${date || "reading"}.pdf"`,
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
