import puppeteer, { type Browser } from "puppeteer";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { PortfolioInput } from "../validation/portfolio.schema";
import { renderCvHtml } from "../cv";
import { renderBusinessCardHtml } from "../businessCard";
import { preparePdfImages } from "./pdfImages";

let browserPromise: Promise<Browser> | undefined;
let fontPromise: Promise<string> | undefined;
let activeRenders = 0;
export class PdfBusyError extends Error {}
function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({ headless: true, timeout: 20_000, args: ["--disable-dev-shm-usage", "--disable-background-networking"] }).then(browser => {
      browser.on("disconnected", () => { browserPromise = undefined; });
      return browser;
    }).catch(error => { browserPromise = undefined; throw error; });
  }
  return browserPromise;
}
async function getFont(): Promise<string> {
  fontPromise ??= readFile(resolve(process.cwd(), "public/fonts/Geist.woff2")).then(bytes => `data:font/woff2;base64,${bytes.toString("base64")}`).catch(error => { fontPromise = undefined; throw error; });
  return fontPromise;
}
/** Shared renderer for the CV and business card; both use their live preview templates. */
async function renderDocumentPdf(portfolio: PortfolioInput, kind: "cv" | "card", publicUrl = ""): Promise<Buffer> {
  if (activeRenders >= 2) throw new PdfBusyError("The PDF service is busy. Please try again in a moment.");
  activeRenders += 1;
  try {
    const [browser, font, prepared] = await Promise.all([getBrowser(), getFont(), preparePdfImages(kind === "card" ? { ...portfolio, projects: [] } : portfolio)]);
    const context = await browser.createBrowserContext();
    try {
      const page = await context.newPage();
      await page.setJavaScriptEnabled(false);
      await page.setRequestInterception(true);
      // Rendering is self-contained. User content cannot make browser network requests.
      page.on("request", request => {
        if (request.url().startsWith("data:") || request.url() === "about:blank") void request.continue();
        else void request.abort();
      });
      const html = kind === "card" ? renderBusinessCardHtml(prepared, publicUrl, font) : renderCvHtml(prepared, font);
      await page.setContent(html, { waitUntil: "load", timeout: 20_000 });
      const size = kind === "card" ? { width: "85mm", height: "55mm" } : { format: "A4" as const };
      const bytes = await page.pdf({ ...size, printBackground: true, preferCSSPageSize: true, timeout: 20_000, tagged: true });
      return Buffer.from(bytes);
    } finally { await context.close(); }
  } finally { activeRenders -= 1; }
}
export function renderPdf(portfolio: PortfolioInput): Promise<Buffer> {
  return renderDocumentPdf(portfolio, "cv");
}
export function renderBusinessCardPdf(portfolio: PortfolioInput, publicUrl: string): Promise<Buffer> {
  return renderDocumentPdf(portfolio, "card", publicUrl);
}
export async function closePdfBrowser(): Promise<void> {
  if (!browserPromise) return;
  const browser = await browserPromise;
  browserPromise = undefined;
  await browser.close();
}
