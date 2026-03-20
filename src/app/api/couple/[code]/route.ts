import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Couple from "@/models/Couple";
import Moment from "@/models/Moment";

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;
    if (!code) {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    await connectDB();

    const couple = await Couple.findOne({ accessCode: code }).lean();
    if (!couple) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const moments = await Moment.find({ coupleId: couple._id })
      .sort({ date: 1, order: 1 })
      .lean();

    return NextResponse.json({ couple, moments });
  } catch (err) {
    console.error("[couple GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
