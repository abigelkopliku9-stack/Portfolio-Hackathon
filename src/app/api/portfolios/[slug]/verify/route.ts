import { NextResponse } from "next/server";

import { getEditKeyHash, getPortfolioBySlug } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { verifyEditKey } from "@/lib/auth/editKey";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const editKey =
    body && typeof body === "object" && body !== null && "editKey" in body
      ? String((body as { editKey: unknown }).editKey ?? "").trim()
      : "";

  if (!editKey) return jsonError("Missing edit key.", 400);

  const storedHash = getEditKeyHash(slug);
  if (!storedHash) return jsonError("Portfolio not found.", 404);
  if (!verifyEditKey(editKey, storedHash)) {
    return jsonError("Invalid edit key.", 401);
  }

  const portfolio = getPortfolioBySlug(slug, { includeUnpublished: true });
  if (!portfolio) return jsonError("Portfolio not found.", 404);
  return jsonOk({ portfolio });
}
