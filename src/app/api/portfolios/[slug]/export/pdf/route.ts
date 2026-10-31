import { NextResponse } from "next/server";
import { getPortfolioBySlug } from "@/lib/db";
import { PdfBusyError, renderPdf } from "@/lib/export/pdf";
import { rateLimit } from "@/lib/rateLimit";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }): Promise<NextResponse> {
  const { slug } = await params;
  const portfolio = getPortfolioBySlug(slug);
  if (!portfolio) return NextResponse.json({ ok: false, error: "Portfolio not found." }, { status: 404 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`pdf:${ip}`, 12, 60_000)) return NextResponse.json({ ok: false, error: "Please wait a minute before downloading another PDF." }, { status: 429, headers: { "Retry-After": "60" } });
  try {
    const file = await renderPdf(portfolio);
    return new NextResponse(new Uint8Array(file), { status: 200, headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${portfolio.slug}-cv.pdf"`, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    if (error instanceof PdfBusyError) return NextResponse.json({ ok: false, error: error.message }, { status: 503, headers: { "Retry-After": "5" } });
    console.error("PDF export failed:", error);
    return NextResponse.json({ ok: false, error: "We couldn’t prepare your PDF. Please try again. Your portfolio and edit key are safe." }, { status: 503 });
  }
}
