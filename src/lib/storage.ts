import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { randomBytes } from "node:crypto";

/**
 * Local storage for user-uploaded images (currently avatars).
 * Files live under `data/uploads/` (next to the SQLite database) and are
 * served through `/api/uploads/[file]` — never from `public/`, so builds
 * are not cache-stamped around runtime files.
 */

const UPLOAD_DIR = "data/uploads";
const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/** Absolute upload directory (respects DATABASE_PATH-style cwd resolution). */
export function uploadDir(): string {
  return isAbsolute(UPLOAD_DIR) ? UPLOAD_DIR : resolve(process.cwd(), UPLOAD_DIR);
}

export type SaveImageResult = { ok: true; url: string; file: string };

/** Validates and persists an uploaded image. Throws on invalid input. */
export async function saveUploadedImage(file: File): Promise<SaveImageResult> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("UNSUPPORTED_TYPE");
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) throw new Error("TOO_LARGE");

  const name = `${randomBytes(12).toString("hex")}${ext}`;
  const dir = uploadDir();
  mkdirSync(dir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  writeFileSync(resolve(dir, name), bytes);
  return { ok: true, url: `/api/uploads/${name}`, file: name };
}

/** Reads a stored upload for serving. Returns null when unknown. */
export function readStoredImage(name: string): { bytes: Buffer; type: string } | null {
  if (!/^[a-f0-9]{24}\.(png|jpg|webp|gif)$/.test(name)) return null;
  const path = resolve(uploadDir(), name);
  if (!path.startsWith(uploadDir()) || !existsSync(path)) return null;
  const type = Object.entries(ALLOWED_TYPES).find(([, ext]) => name.endsWith(ext))?.[0];
  if (!type) return null;
  return { bytes: readFileSync(path), type };
}
