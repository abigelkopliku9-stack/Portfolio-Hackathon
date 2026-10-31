import { NextResponse } from "next/server";

import { getPortfolioBySlug } from "@/lib/db";
import { buildExportDocument } from "@/lib/export/model";
import { renderPdf } from "@/lib/export/pdf";

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

  const file = renderPdf(buildExportDocument(portfolio));
  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slug}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
