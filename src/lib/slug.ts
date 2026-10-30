import { randomBytes } from "node:crypto";

const SLUG_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const SLUG_SUFFIX_LENGTH = 4;
const SLUG_BASE_MAX = 40;

/** "Ada Lovelace!" -> "ada-lovelace" */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_BASE_MAX)
    .replace(/-+$/g, "");
}

export function randomSuffix(length = SLUG_SUFFIX_LENGTH): string {
  const bytes = randomBytes(length);
  let out = "";
  for (const byte of bytes) out += SLUG_ALPHABET[byte % SLUG_ALPHABET.length];
  return out;
}

/**
 * Public URL identifier. The random suffix keeps two "John Smith" portfolios
 * apart without asking the user to invent a username.
 */
export function buildSlug(fullName: string): string {
  const base = slugify(fullName) || "portfolio";
  return `${base}-${randomSuffix()}`;
}

/** Slugs that would collide with our own routes. */
const RESERVED_SLUGS = new Set([
  "api",
  "create",
  "dashboard",
  "p",
  "admin",
  "login",
  "new",
  "settings",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}
