import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Couple from "@/models/Couple";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, error: "Code required" }, { status: 400 });
    }

    await connectDB();

    const couple = await Couple.findOne({ accessCode: code.trim() });

    if (!couple) {
      return NextResponse.json({ valid: false, error: "Invalid code" }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      coupleId: couple._id.toString(),
      theme: couple.theme,
      partner1Name: couple.partner1Name,
      partner2Name: couple.partner2Name,
      code: couple.accessCode,
    });
  } catch (err) {
    console.error("[auth]", err);
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}
