import { NextResponse } from "next/server";
import { readStoredImage } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * GET /api/uploads/[file] — serves stored upload images with long-lived
 * caching (filenames are content-random, never reused).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const stored = readStoredImage(file);
  if (!stored) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  return new NextResponse(new Uint8Array(stored.bytes), {
    headers: {
      "Content-Type": stored.type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
