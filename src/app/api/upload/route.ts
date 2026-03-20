import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const MAX_SIZE_MB = 5;
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

    // Build the upload path
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${uuidv4()}.${ext}`;
    const subDir = coupleId || "general";
    const uploadDir = path.join(process.cwd(), "public", "uploads", subDir);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);

    const filePath = `/uploads/${subDir}/${fileName}`;

    return NextResponse.json({ path: filePath });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export const config = {
  api: { bodyParser: false },
};
