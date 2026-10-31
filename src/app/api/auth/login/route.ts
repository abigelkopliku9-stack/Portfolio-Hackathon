import { NextResponse } from "next/server";

import { jsonError, jsonOk } from "@/lib/api";
import { burnPasswordCheck, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { firstIssue, loginSchema } from "@/lib/auth/validation";
import { getUserByEmail } from "@/lib/db/userRepo";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

const INVALID = "Invalid email or password.";

export async function POST(request: Request): Promise<NextResponse> {
  // Slows down password guessing: 10 attempts per minute per IP address.
  if (!rateLimit(`login:${clientIp(request)}`, 10, 60_000)) {
    return jsonError("Too many attempts. Try again in a minute.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return jsonError(firstIssue(parsed.error), 400);
  const { email, password } = parsed.data;

  const user = getUserByEmail(email);
  if (!user) {
    await burnPasswordCheck(password);
    return jsonError(INVALID, 401);
  }
  if (!(await verifyPassword(password, user.passwordHash))) return jsonError(INVALID, 401);

  await createSession(user.id);
  return jsonOk({ user: { id: user.id, email: user.email, name: user.name } });
}
