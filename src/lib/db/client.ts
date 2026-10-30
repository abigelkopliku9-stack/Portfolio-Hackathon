import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { SCHEMA_SQL } from "./schema";

/**
 * One SQLite connection per process.
 *
 * Next.js dev mode reloads modules on every save; without the global cache you
 * would leak a file handle per edit. `node:sqlite` is built into Node, so there
 * is nothing to install and no native build step.
 */

type DbGlobal = typeof globalThis & { __portfolioDb?: DatabaseSync };

const globalForDb = globalThis as DbGlobal;

export const DEFAULT_DATABASE_PATH = "data/portfolio.db";

export function databasePath(): string {
  const configured = process.env.DATABASE_PATH?.trim();
  const value = configured && configured.length > 0 ? configured : DEFAULT_DATABASE_PATH;
  if (value === ":memory:" || value.startsWith("file:")) return value;
  return isAbsolute(value) ? value : resolve(process.cwd(), value);
}

export function getDb(): DatabaseSync {
  if (globalForDb.__portfolioDb) return globalForDb.__portfolioDb;

  const file = databasePath();
  if (file !== ":memory:") mkdirSync(dirname(file), { recursive: true });

  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec(SCHEMA_SQL);

  globalForDb.__portfolioDb = db;
  return db;
}

/** Test helper: closes and forgets the cached connection. */
export function closeDb(): void {
  if (!globalForDb.__portfolioDb) return;
  globalForDb.__portfolioDb.close();
  globalForDb.__portfolioDb = undefined;
}

/** Runs `fn` inside a transaction, rolling back on any thrown error. */
export function transaction<T>(fn: (db: DatabaseSync) => T): T {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn(db);
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
