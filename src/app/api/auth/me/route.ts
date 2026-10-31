import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser();
  return NextResponse.json({ ok: true, user }, { headers: { "Cache-Control": "no-store" } });
}
