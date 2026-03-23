import { NextRequest, NextResponse } from "next/server";

const BLOB_HOSTNAME = "public.blob.vercel-storage.com";
const PRIVATE_BLOB_HOSTNAME = "private.blob.vercel-storage.com";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  // Only proxy Vercel Blob URLs to prevent SSRF
  if (
    !parsed.hostname.endsWith(BLOB_HOSTNAME) &&
    !parsed.hostname.endsWith(PRIVATE_BLOB_HOSTNAME)
  ) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return new NextResponse("Blob token not configured", { status: 500 });
  }

  const blobRes = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!blobRes.ok) {
    return new NextResponse("Failed to fetch image", { status: blobRes.status });
  }

  const contentType = blobRes.headers.get("content-type") ?? "image/webp";
  const body = await blobRes.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
