import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { PortfolioRecord } from "@/lib/db";
import { readStoredImage } from "./storage";
import { renderCvHtml } from "./cv";
function embedUpload(url: string): string {
  const match = /^\/api\/uploads\/([a-f0-9]{24}\.(?:png|jpg|webp|gif))$/.exec(url);
  if (!match) return url;
  const image = readStoredImage(match[1]);
  return image ? `data:${image.type};base64,${image.bytes.toString("base64")}` : "";
}
export function renderPortfolioHtml(portfolio: PortfolioRecord): string {
  const font = readFileSync(resolve(process.cwd(), "public/fonts/Geist.woff2"));
  const prepared = { ...portfolio, profile: { ...portfolio.profile, avatarUrl: embedUpload(portfolio.profile.avatarUrl) }, projects: portfolio.projects.map(project => ({ ...project, imageUrl: embedUpload(project.imageUrl) })) };
  return renderCvHtml(prepared, `data:font/woff2;base64,${font.toString("base64")}`);
}
