import type { DatabaseSync } from "node:sqlite";

import { getDb } from "./client";

/**
 * Tables for accounts and login sessions. They are created automatically the
 * first time auth is used, so you do not need to run any migration, and your
 * existing portfolios are not touched.
 */
export const AUTH_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  password_hash  TEXT NOT NULL,
  created_at     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
`;

const ready = new WeakSet<DatabaseSync>();

export function getAuthDb(): DatabaseSync {
  const db = getDb();
  if (!ready.has(db)) {
    db.exec(AUTH_SCHEMA_SQL);
    ready.add(db);
  }
  return db;
}
