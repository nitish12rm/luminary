import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Moment from "@/models/Moment";
import Couple from "@/models/Couple";

/**
 * POST /api/moment
 * Header: x-access-code: <your 6-char code>
 * Body:
 * {
 *   category: string,
 *   customLabel?: string,
 *   date: string,          // ISO date
 *   rawDescription: string,
 *   poeticNarrative?: string,
 *   photoPath?: string,
 *   photoAlt?: string,
 *   order?: number
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const accessCode = req.headers.get("x-access-code");
    if (!accessCode) {
      return NextResponse.json({ error: "x-access-code header required" }, { status: 401 });
    }

    await connectDB();

    const couple = await Couple.findOne({ accessCode: accessCode.trim() });
    if (!couple) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.category || !body.date || !body.rawDescription) {
      return NextResponse.json({ error: "category, date, and rawDescription are required" }, { status: 400 });
    }

    const existingCount = await Moment.countDocuments({ coupleId: couple._id });

    const moment = await Moment.create({
      coupleId: couple._id,
      category: body.category,
      customLabel: body.customLabel || "",
      date: new Date(body.date),
      rawDescription: body.rawDescription,
      poeticNarrative: body.poeticNarrative || "",
      photoPath: body.photoPath || null,
      photoAlt: body.photoAlt || "",
      order: body.order ?? existingCount,
    });

    return NextResponse.json({ success: true, moment });
  } catch (err) {
    console.error("[moment POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
