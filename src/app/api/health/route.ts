import { NextResponse } from "next/server";

import { countPortfolios, getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Piece 1 proof of life. If this endpoint answers 200, the SQLite file exists,
 * the schema was applied, and every route in Piece 2 will find a working db.
 */
export async function GET() {
  try {
    const db = getDb();
    const row = db.prepare("SELECT sqlite_version() AS version").get() as unknown as {
      version: string;
    };
    return NextResponse.json({
      ok: true,
      db: "connected",
      engine: `sqlite ${row.version}`,
      portfolios: countPortfolios(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        db: "error",
        message: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 503 },
    );
  }
}
