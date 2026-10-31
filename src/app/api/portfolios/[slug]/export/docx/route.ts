import { NextResponse } from "next/server";

import { getPortfolioBySlug } from "@/lib/db";
import { renderDocx } from "@/lib/export/docx";
import { buildExportDocument } from "@/lib/export/model";

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

  const file = renderDocx(buildExportDocument(portfolio));
  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${slug}.docx"`,
      "Cache-Control": "no-store",
    },
  });
}
