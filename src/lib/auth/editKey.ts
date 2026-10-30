import { createHash, randomInt, timingSafeEqual } from "node:crypto";

/**
 * The edit key is the only credential in the MVP: whoever holds it plus the
 * dashboard URL can update a portfolio. We store a SHA-256 hash, never the
 * raw key, so a leaked database file does not hand over every portfolio.
 */

// No 0/O/1/l/I: the key will be copied by hand at least once.
const KEY_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const KEY_LENGTH = 24;

export function generateEditKey(): string {
  let key = "";
  for (let i = 0; i < KEY_LENGTH; i += 1) {
    key += KEY_ALPHABET[randomInt(KEY_ALPHABET.length)];
  }
  return key;
}

export function hashEditKey(key: string): string {
  return createHash("sha256").update(key.trim(), "utf8").digest("hex");
}

/** Constant-time comparison; false for empty or malformed input. */
export function verifyEditKey(candidate: string, storedHash: string): boolean {
  if (!candidate || !storedHash) return false;
  const a = Buffer.from(hashEditKey(candidate), "hex");
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}
