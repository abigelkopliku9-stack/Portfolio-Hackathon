import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import { getAuthDb } from "@/lib/db/authDb";

/**
 * Login sessions.
 * - The browser gets a random token in an HTTP-only cookie (JavaScript on the
 *   page cannot read it).
 * - The database only stores a SHA-256 hash of that token, so a leaked
 *   database file cannot be used to log in as someone.
 */
export const SESSION_COOKIE = "pg_session";
const SESSION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export type AuthUser = { id: string; email: string; name: string };

function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  const db = getAuthDb();

  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(now);
  db.prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").run(
    hashToken(token),
    userId,
    now,
    now + SESSION_DAYS * DAY_MS,
  );

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const row = getAuthDb()
    .prepare(
      `SELECT u.id AS id, u.email AS email, u.name AS name
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(hashToken(token), Date.now()) as unknown as AuthUser | undefined;

  return row ? { id: row.id, email: row.email, name: row.name } : null;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    getAuthDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  }
  jar.delete(SESSION_COOKIE);
}
