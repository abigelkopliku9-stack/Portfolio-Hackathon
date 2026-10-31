import { randomUUID } from "node:crypto";

import { getAuthDb } from "./authDb";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
};

type UserRow = { id: string; email: string; name: string; password_hash: string };

function toUser(row: UserRow | undefined): UserRecord | null {
  if (!row) return null;
  return { id: row.id, email: row.email, name: row.name, passwordHash: row.password_hash };
}

export function getUserByEmail(email: string): UserRecord | null {
  const row = getAuthDb()
    .prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?")
    .get(email) as unknown as UserRow | undefined;
  return toUser(row);
}

export function getUserById(id: string): UserRecord | null {
  const row = getAuthDb()
    .prepare("SELECT id, email, name, password_hash FROM users WHERE id = ?")
    .get(id) as unknown as UserRow | undefined;
  return toUser(row);
}

/** Throws if the email is already taken (UNIQUE constraint). */
export function createUser(input: { email: string; name: string; passwordHash: string }): UserRecord {
  const id = randomUUID();
  getAuthDb()
    .prepare("INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(id, input.email, input.name, input.passwordHash, Date.now());
  return { id, email: input.email, name: input.name, passwordHash: input.passwordHash };
}
