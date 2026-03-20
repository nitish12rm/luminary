import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Couple from "@/models/Couple";
import Moment from "@/models/Moment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { couple: coupleData, moments: momentsData } = body;

    if (!coupleData?.accessCode || !coupleData?.partner1Name || !coupleData?.partner2Name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Check code availability
    const existing = await Couple.findOne({ accessCode: coupleData.accessCode.trim() });
    if (existing) {
      return NextResponse.json({ error: "Access code already taken" }, { status: 409 });
    }

    // Create couple
    const couple = await Couple.create({
      accessCode: coupleData.accessCode.trim(),
      partner1Name: coupleData.partner1Name.trim(),
      partner2Name: coupleData.partner2Name.trim(),
      startDate: new Date(coupleData.startDate),
      theme: coupleData.theme || "blush",
      coverPhotoPath: coupleData.coverPhotoPath || null,
      bio: coupleData.bio || "",
    });

    // Create moments if provided
    if (momentsData && Array.isArray(momentsData) && momentsData.length > 0) {
      const momentDocs = momentsData.map((m: Record<string, unknown>, idx: number) => ({
        coupleId: couple._id,
        category: m.category,
        customLabel: m.customLabel || "",
        date: new Date(m.date as string),
        rawDescription: m.rawDescription,
        poeticNarrative: m.poeticNarrative || "",
        photoPath: m.photoPath || null,
        photoAlt: m.photoAlt || "",
        order: m.order ?? idx,
      }));

      await Moment.insertMany(momentDocs);
    }

    return NextResponse.json({
      success: true,
      coupleId: couple._id.toString(),
      accessCode: couple.accessCode,
    });
  } catch (err) {
    console.error("[couple POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
