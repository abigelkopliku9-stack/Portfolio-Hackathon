import { NextResponse } from "next/server";

/** Uniform success envelope. */
export function jsonOk(data: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json({ ok: true, ...data }, { status });
}

/** Uniform error envelope. `details` is optional and only used for validation. */
export function jsonError(
  message: string,
  status = 400,
  details?: unknown,
): NextResponse {
  const body: Record<string, unknown> = { ok: false, error: message };
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status });
}
