import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";

const MAX_SIZE_MB = 15;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const coupleId = formData.get("coupleId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, or GIF allowed" }, { status: 400 });
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > MAX_SIZE_MB) {
      return NextResponse.json({ error: `File too large. Max ${MAX_SIZE_MB}MB` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let compressed: Buffer;
    let contentType: string;

    if (file.type === "image/gif") {
      // GIFs: skip compression to preserve animation
      compressed = buffer;
      contentType = "image/gif";
    } else {
      // Convert to WebP with high quality + auto-orient from EXIF
      compressed = await sharp(buffer)
        .rotate()                                          // auto-correct EXIF orientation
        .resize(2400, 2400, {
          fit: "inside",
          withoutEnlargement: true,                       // never upscale
        })
        .webp({ quality: 88, effort: 4, smartSubsample: true })
        .toBuffer();
      contentType = "image/webp";
    }

    const ext = file.type === "image/gif" ? "gif" : "webp";
    const fileName = `luminary/${coupleId || "general"}/${Date.now()}.${ext}`;

    const blob = await put(fileName, compressed, {
      access: "public",
      contentType,
    });

    return NextResponse.json({ path: blob.url });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
