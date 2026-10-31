import { NextResponse } from "next/server";
import { saveUploadedImage } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * POST /api/upload — accepts a multipart `image` file and stores it locally.
 * Returns `{ ok, url }` (root-relative, served by `/api/uploads/[file]`).
 * On validation failure returns `{ ok: false, error: CODE }` — the client
 * maps the code to a localized message.
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const image = form.get("image");
    if (!(image instanceof File)) throw new Error("MISSING_FILE");
    return NextResponse.json(await saveUploadedImage(image));
  } catch (error) {
    const code = String(error instanceof Error ? error.message : "SAVE_FAILED");
    const status = code === "UNSUPPORTED_TYPE" || code === "TOO_LARGE" ? 400 : 500;
    return NextResponse.json({ ok: false, error: code }, { status });
  }
}
