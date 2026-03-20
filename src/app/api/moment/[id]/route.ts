import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Moment from "@/models/Moment";
import Couple from "@/models/Couple";

/** Verify the caller owns the moment via accessCode header */
async function authorize(momentId: string, req: NextRequest) {
  const accessCode = req.headers.get("x-access-code");
  if (!accessCode) return null;

  const moment = await Moment.findById(momentId);
  if (!moment) return null;

  const couple = await Couple.findOne({ accessCode: accessCode.trim() });
  if (!couple) return null;

  if (String(moment.coupleId) !== String(couple._id)) return null;

  return moment;
}

/**
 * PATCH /api/moment/[id]
 * Header: x-access-code: <your 6-char code>
 * Body (all fields optional):
 * {
 *   category?: string,
 *   customLabel?: string,
 *   date?: string,          // ISO date
 *   rawDescription?: string,
 *   poeticNarrative?: string,
 *   photoPath?: string,
 *   photoAlt?: string,
 *   order?: number
 * }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const moment = await authorize(params.id, req);
    if (!moment) {
      return NextResponse.json({ error: "Unauthorized or not found" }, { status: 401 });
    }

    const body = await req.json();

    const ALLOWED = [
      "category", "customLabel", "date",
      "rawDescription", "poeticNarrative",
      "photoPath", "photoAlt", "order",
    ];

    const updates: Record<string, unknown> = {};
    for (const key of ALLOWED) {
      if (key in body) {
        updates[key] = key === "date" ? new Date(body[key]) : body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await Moment.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ success: true, moment: updated });
  } catch (err) {
    console.error("[moment PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/moment/[id]
 * Header: x-access-code: <your 6-char code>
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const moment = await authorize(params.id, req);
    if (!moment) {
      return NextResponse.json({ error: "Unauthorized or not found" }, { status: 401 });
    }

    await Moment.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[moment DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
