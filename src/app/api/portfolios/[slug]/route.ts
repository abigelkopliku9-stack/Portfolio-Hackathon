import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  deletePortfolio,
  getEditKeyHash,
  getPortfolioBySlug,
  updatePortfolio,
} from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { verifyEditKey } from "@/lib/auth/editKey";
import { portfolioInputSchema } from "@/lib/validation/portfolio.schema";

export const dynamic = "force-dynamic";

function readEditKey(request: Request, body?: unknown): string {
  const header = request.headers.get("x-edit-key");
  if (header && header.trim().length > 0) return header.trim();
  if (body && typeof body === "object" && body !== null && "editKey" in body) {
    const value = (body as { editKey?: unknown }).editKey;
    if (typeof value === "string") return value.trim();
  }
  return "";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const portfolio = getPortfolioBySlug(slug); // published only
  if (!portfolio) return jsonError("Portfolio not found.", 404);
  return jsonOk({ portfolio });
}

export async function PUT(
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

  const editKey = readEditKey(request, body);
  if (!editKey) return jsonError("Missing edit key (x-edit-key header).", 401);

  const storedHash = getEditKeyHash(slug);
  if (!storedHash) return jsonError("Portfolio not found.", 404);
  if (!verifyEditKey(editKey, storedHash)) {
    return jsonError("Invalid edit key.", 401);
  }

  // Allow the edit key to live in the body; strip it before validation.
  const payload =
    body && typeof body === "object" && body !== null && "editKey" in body
      ? Object.fromEntries(
          Object.entries(body as Record<string, unknown>).filter(([k]) => k !== "editKey"),
        )
      : body;

  const parsed = portfolioInputSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("Validation failed.", 400, parsed.error.flatten());
  }

  const updated = updatePortfolio(slug, parsed.data);
  if (!updated) return jsonError("Portfolio not found.", 404);

  revalidatePath(`/p/${slug}`);
  return jsonOk({ portfolio: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const editKey = request.headers.get("x-edit-key")?.trim() ?? "";
  if (!editKey) return jsonError("Missing edit key (x-edit-key header).", 401);

  const storedHash = getEditKeyHash(slug);
  if (!storedHash) return jsonError("Portfolio not found.", 404);
  if (!verifyEditKey(editKey, storedHash)) {
    return jsonError("Invalid edit key.", 401);
  }

  const removed = deletePortfolio(slug);
  if (!removed) return jsonError("Portfolio not found.", 404);
  revalidatePath(`/p/${slug}`);
  return jsonOk({ deleted: true }, 200);
}
