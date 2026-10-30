import { NextResponse } from "next/server";

import { getPortfolioBySlug } from "@/lib/db";
import { renderPortfolioHtml } from "@/lib/exportHtml";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const portfolio = getPortfolioBySlug(slug);
  if (!portfolio) {
    return NextResponse.json({ ok: false, error: "Portfolio not found." }, { status: 404 });
  }

  const html = renderPortfolioHtml(portfolio);
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.html"`,
    },
  });
}
