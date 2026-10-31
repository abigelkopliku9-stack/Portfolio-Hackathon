import { THEMES, type Theme } from "./validation/portfolio.schema";
export type LocalPortfolio = { slug: string; fullName: string; headline: string; theme: Theme; updatedAt: string };
const KEY = "portfolio-library-v1";
export const LIBRARY_EVENT = "portfolio-library-change";
export function getLocalPortfolios(): LocalPortfolio[] {
  try { const data: unknown = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(data) ? data.filter((p): p is LocalPortfolio => Boolean(p && typeof p === "object" && typeof p.slug === "string" && /^[a-z0-9-]+$/.test(p.slug) && typeof p.fullName === "string" && typeof p.headline === "string" && typeof p.updatedAt === "string" && THEMES.includes(p.theme))) : []; } catch { return []; }
}
export function rememberPortfolio(portfolio: LocalPortfolio) {
  try { const items = getLocalPortfolios().filter(p => p.slug !== portfolio.slug); localStorage.setItem(KEY, JSON.stringify([portfolio, ...items].slice(0, 50))); window.dispatchEvent(new Event(LIBRARY_EVENT)); } catch { /* The edit key and downloaded access file still work without localStorage. */ }
}
