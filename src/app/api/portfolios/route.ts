import { NextResponse } from "next/server";

import { createPortfolio } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";
import { portfolioInputSchema } from "@/lib/validation/portfolio.schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";

  if (!rateLimit(`create:${ip}`, 10, 60_000)) {
    return jsonError("Too many requests. Try again in a minute.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = portfolioInputSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed.", 400, parsed.error.flatten());
  }

  try {
    const { portfolio, editKey } = createPortfolio(parsed.data);
    return jsonOk(
      {
        portfolio,
        editKey,
        publicUrl: `/p/${portfolio.slug}`,
        adminUrl: `/dashboard/${portfolio.slug}`,
      },
      201,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save portfolio.";
    return jsonError(message, 500);
  }
}
