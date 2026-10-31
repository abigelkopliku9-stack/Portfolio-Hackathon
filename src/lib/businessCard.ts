import type { PortfolioInput } from "./validation/portfolio.schema";
import { CV_THEMES } from "./cv";
export const BUSINESS_CARD_WIDTH = 85 * 96 / 25.4;
export const BUSINESS_CARD_HEIGHT = 55 * 96 / 25.4;
export const BUSINESS_CARD_CSS = `
.business-card-sheet{box-sizing:border-box;position:relative;width:85mm;height:55mm;padding:20px 23px;overflow:hidden;display:flex;flex-direction:column;background:var(--card-bg);color:var(--card-fg);font-family:MyfolioCard,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;break-inside:avoid;page-break-inside:avoid;break-after:page;isolation:isolate}
.business-card-sheet *{box-sizing:border-box}.business-card-sheet h1,.business-card-sheet p{margin:0}.business-card-sheet a{color:inherit;text-decoration:none}.business-card-sheet:last-child{break-after:auto}.business-card-sheet[data-theme=gradient]{background:radial-gradient(ellipse at 8% 5%,#cbe7c0bb,transparent 60%),radial-gradient(ellipse at 100% 100%,#bfe1b388,transparent 60%),var(--card-bg)}.bc-front::before{content:'';position:absolute;inset:0 auto 0 0;width:4px;background:var(--card-accent)}.bc-orbit{position:absolute;width:200px;height:200px;border:1px solid var(--card-line);border-radius:50%;right:-100px;bottom:-110px;z-index:-1}.bc-orbit::after{content:'';position:absolute;inset:15px;border:1px solid var(--card-line);border-radius:50%}.bc-top{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:26px}.bc-monogram{display:inline-flex;align-items:center;justify-content:center;font-size:12px;line-height:1;font-weight:650;letter-spacing:-.6px;padding:6px 7px;border:1px solid var(--card-line);border-radius:5px;color:var(--card-accent)}.bc-kicker{font-size:6px;line-height:1.4;letter-spacing:1.5px;font-weight:500;color:var(--card-muted)}.bc-photo{display:block;width:29px;height:29px;border-radius:50%;object-fit:cover;border:2px solid var(--card-soft)}.bc-identity{display:flex;flex:1;flex-direction:column;justify-content:center;gap:8px;padding:9px 0}.business-card-sheet h1{font-size:var(--card-name-size,29px);font-weight:600;line-height:1.13;letter-spacing:-.9px;overflow-wrap:anywhere}.bc-headline{font-size:var(--card-headline-size,10.5px);line-height:1.4;color:var(--card-muted);overflow-wrap:anywhere}.bc-front-footer{display:flex;align-items:center;gap:8px;font-size:5.5px;font-weight:500;letter-spacing:1.7px;color:var(--card-muted)}.bc-front-footer::before{content:'';width:19px;height:1px;background:var(--card-accent)}.bc-back .bc-top{padding-bottom:10px;border-bottom:1px solid var(--card-line)}.bc-back .bc-monogram{font-size:9px;padding:4px 5px}.bc-contacts{display:flex;flex:1;flex-direction:column;justify-content:center;gap:10px;padding:10px 0}.bc-contact{min-width:0;display:flex;flex-direction:column;gap:2px}.bc-contact-label{font-size:5.5px;font-weight:550;letter-spacing:1.2px;color:var(--card-muted);text-transform:uppercase}.bc-contact-value{font-size:10.5px;line-height:1.3;color:var(--card-fg);overflow-wrap:anywhere}.bc-back[data-compact=true] .bc-contacts{gap:5px;padding:7px 0}.bc-back[data-compact=true] .bc-contact-value{font-size:8px;line-height:1.25}.bc-portfolio-link{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--card-line);padding-top:9px;font-size:8px;font-weight:500;color:var(--card-accent)!important}.bc-empty{font-size:10px;line-height:1.7;color:var(--card-muted)}
@page{size:85mm 55mm;margin:0}
@media print{html,body{margin:0;padding:0}.business-card-sheet{width:85mm;height:55mm;border-radius:0!important;box-shadow:none!important}}
`;
const esc = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
function httpUrl(value: string): string {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; } catch { return ""; }
}
function displayUrl(value: string): string {
  const url = new URL(value); const host = url.hostname.replace(/^www\./, "");
  const path = url.pathname === "/" ? "" : url.pathname;
  const label = `${host}${path.length < 25 ? path : ""}`;
  return label.length > 46 ? `${label.slice(0, 43)}...` : label;
}
export function renderBusinessCardFaces(portfolio: PortfolioInput, publicUrl = ""): [string, string] {
  const p = portfolio.profile; const colors = CV_THEMES[portfolio.theme] || CV_THEMES.minimal;
  const nameSize = p.fullName.length > 60 ? 17 : p.fullName.length > 38 ? 21 : p.fullName.length > 24 ? 25 : 29;
  const headlineSize = p.headline.length > 80 ? 9 : 10.5;
  const variables = `${Object.entries(colors).map(([key, value]) => `--card-${key}:${value}`).join(";")};--card-name-size:${nameSize}px;--card-headline-size:${headlineSize}px`;
  const attrs = `class="business-card-sheet" data-theme="${esc(portfolio.theme)}" style="${variables}"`;
  const initials = p.fullName.trim().split(/\s+/).slice(0, 2).map(n => Array.from(n)[0] || "").join("") || "YN";
  const monogram = `<span class="bc-monogram">${esc(initials)}.</span>`;
  const photo = /^(https?:\/\/|\/api\/uploads\/|data:image\/(?:png|jpeg|webp|gif);base64,)/i.test(p.avatarUrl) ? `<img class="bc-photo" src="${esc(p.avatarUrl)}" alt="${esc(p.fullName)}" />` : '<span class="bc-kicker">A LITTLE INTRODUCTION</span>';
  const front = `<article ${attrs.replace('class="business-card-sheet"', 'class="business-card-sheet bc-front"')} aria-label="Business card front"><div class="bc-orbit" aria-hidden="true"></div><header class="bc-top">${monogram}${photo}</header><div class="bc-identity"><h1>${esc(p.fullName || "Your name")}</h1><p class="bc-headline">${esc(p.headline || "Your next chapter starts here.")}</p></div><div class="bc-front-footer">PERSONAL PORTFOLIO</div></article>`;
  const contacts: string[] = [];
  const contact = (label: string, content: string) => `<div class="bc-contact"><span class="bc-contact-label">${label}</span><span class="bc-contact-value">${content}</span></div>`;
  if (p.email) contacts.push(contact("Email", `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`));
  if (p.location) contacts.push(contact("Based in", esc(p.location)));
  const validSocials = portfolio.socials.filter(s => httpUrl(s.url));
  const social = validSocials.find(s => /website|portfolio|site/i.test(s.label)) || validSocials.find(s => /linkedin/i.test(s.label)) || validSocials[0];
  if (social) contacts.push(contact(esc(social.label), `<a href="${esc(httpUrl(social.url))}" target="_blank" rel="noopener noreferrer">${esc(displayUrl(social.url))}</a>`));
  const href = httpUrl(publicUrl);
  const footer = href ? `<a class="bc-portfolio-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer"><span>View my portfolio</span><span aria-hidden="true">↗</span></a>` : '<div class="bc-portfolio-link"><span>Your portfolio link</span><span aria-hidden="true">↗</span></div>';
  const compact = p.email.length > 60 || p.location.length > 40;
  const back = `<article ${attrs.replace('class="business-card-sheet"', 'class="business-card-sheet bc-back"')} data-compact="${compact}" aria-label="Business card back"><header class="bc-top"><span class="bc-kicker">LET’S CONNECT</span>${monogram}</header><div class="bc-contacts">${contacts.length ? contacts.join("") : '<p class="bc-empty">A small introduction.<br />A new connection.</p>'}</div>${footer}</article>`;
  return [front, back];
}
export function renderBusinessCardHtml(portfolio: PortfolioInput, publicUrl: string, fontSource = "/fonts/Geist.woff2"): string {
  const bg = (CV_THEMES[portfolio.theme] || CV_THEMES.minimal).bg;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>${esc(portfolio.profile.fullName)} - Business card | Myfolio</title><style>@font-face{font-family:MyfolioCard;src:url("${esc(fontSource)}") format("woff2");font-weight:100 900;font-display:swap}html,body{margin:0;padding:0;background:${bg}}${BUSINESS_CARD_CSS}</style></head><body>${renderBusinessCardFaces(portfolio, publicUrl).join("")}</body></html>`;
}
