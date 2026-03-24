import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Couple from "@/models/Couple";
import crypto from "crypto";

function hashPin(pin: string, accessCode: string) {
  return crypto.createHash("sha256").update(`${pin}:${accessCode}`).digest("hex");
}

function makeCookieToken(accessCode: string) {
  const secret = process.env.COOKIE_SECRET || "luminary-pin-secret";
  return crypto.createHmac("sha256", secret).update(accessCode).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { code, pin } = await req.json();

    if (!code || !pin || typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await connectDB();
    const couple = await Couple.findOne({ accessCode: code.trim() });

    if (!couple) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // No PIN set on this couple — allow access
    if (!couple.pin) {
      const token = makeCookieToken(code);
      const res = NextResponse.json({ success: true });
      res.cookies.set(`lum_pin_${code}`, token, {
        httpOnly: true,
        sameSite: "strict",
        path: `/journey/${code}`,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return res;
    }

    const expected = hashPin(pin, code.trim());
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(couple.pin))) {
      return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
    }

    const token = makeCookieToken(code);
    const res = NextResponse.json({ success: true });
    res.cookies.set(`lum_pin_${code}`, token, {
      httpOnly: true,
      sameSite: "strict",
      path: `/journey/${code}`,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  } catch (err) {
    console.error("[pin-verify]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
