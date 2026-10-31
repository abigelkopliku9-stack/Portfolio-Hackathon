import { NextResponse } from "next/server";

import { jsonOk } from "@/lib/api";
import { destroySession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(): Promise<NextResponse> {
  await destroySession();
  return jsonOk({});
}
