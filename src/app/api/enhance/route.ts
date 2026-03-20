import { NextRequest, NextResponse } from "next/server";
import { enhanceMoment } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { description, category, partner1, partner2, date } = await req.json();

    if (!description || !category) {
      return NextResponse.json({ error: "description and category are required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API not configured" }, { status: 503 });
    }

    const narrative = await enhanceMoment({
      description,
      category,
      partner1: partner1 || "Partner 1",
      partner2: partner2 || "Partner 2",
      date: date || new Date().toLocaleDateString(),
    });

    return NextResponse.json({ narrative });
  } catch (err) {
    console.error("[enhance]", err);
    const message = err instanceof Error ? err.message : "Failed to enhance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
