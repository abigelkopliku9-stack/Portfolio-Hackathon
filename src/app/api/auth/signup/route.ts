import { NextResponse } from "next/server";

import { jsonError, jsonOk } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { firstIssue, signupSchema } from "@/lib/auth/validation";
import { createUser, getUserByEmail } from "@/lib/db/userRepo";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!rateLimit(`signup:${clientIp(request)}`, 5, 60_000)) {
    return jsonError("Too many attempts. Try again in a minute.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) return jsonError(firstIssue(parsed.error), 400);
  const { name, email, password } = parsed.data;

  if (getUserByEmail(email)) return jsonError("An account with this email already exists.", 409);

  try {
    const user = createUser({ email, name, passwordHash: await hashPassword(password) });
    await createSession(user.id);
    return jsonOk({ user: { id: user.id, email: user.email, name: user.name } }, 201);
  } catch (error) {
    // Two people signing up with the same email at the same moment.
    if (error instanceof Error && /UNIQUE/i.test(error.message)) {
      return jsonError("An account with this email already exists.", 409);
    }
    return jsonError("Could not create your account. Please try again.", 500);
  }
}
