import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import { readStoredImage } from "../storage";
import type { PortfolioInput } from "../validation/portfolio.schema";
const MAX_BYTES = 4 * 1024 * 1024;
/** External profile images must resolve to public addresses, including after redirects. */
export function isPublicAddress(address: string): boolean {
  const ip = address.toLowerCase();
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && [0, 168].includes(b)) || (a === 100 && b >= 64 && b <= 127) || (a === 198 && [18, 19].includes(b)));
  }
  // Only global IPv6 unicast. IPv4-mapped, local and multicast addresses are excluded.
  return isIP(ip) === 6 && /^[23]/.test(ip) && !ip.startsWith("2001:db8:");
}
async function remoteImage(value: string, remaining = 3): Promise<string> {
  if (remaining <= 0) return "";
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || (url.port && !["80", "443"].includes(url.port))) return "";
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(item => !isPublicAddress(item.address))) return "";
  const address = addresses[0];
  const result = await new Promise<{ data?: string; redirect?: string }>((accept, reject) => {
    const request = (url.protocol === "https:" ? httpsRequest : httpRequest)(url, {
      headers: { Accept: "image/png,image/jpeg,image/webp,image/gif", "User-Agent": "Myfolio-PDF/1.0" },
      // Pin the validated address, rather than resolving the hostname again during the request.
      lookup: (_hostname, _options, callback) => callback(null, address.address, address.family),
    }, response => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode || 0) && response.headers.location) {
        response.resume(); accept({ redirect: new URL(response.headers.location, url).href }); return;
      }
      const type = (response.headers["content-type"] || "").split(";")[0].trim();
      if (response.statusCode !== 200 || !/^image\/(png|jpeg|webp|gif)$/.test(type) || Number(response.headers["content-length"] || 0) > MAX_BYTES) { response.destroy(); accept({}); return; }
      const chunks: Buffer[] = []; let size = 0;
      response.on("data", (chunk: Buffer) => { size += chunk.length; if (size > MAX_BYTES) { response.destroy(); reject(new Error("Image exceeds size limit")); } else chunks.push(chunk); });
      response.on("end", () => accept({ data: `data:${type};base64,${Buffer.concat(chunks).toString("base64")}` }));
      response.on("error", reject);
    });
    const deadline = setTimeout(() => request.destroy(new Error("Image request timed out")), 5000);
    request.on("close", () => clearTimeout(deadline));
    request.setTimeout(4000, () => request.destroy(new Error("Image request timed out")));
    request.on("error", reject); request.end();
  });
  return result.redirect ? remoteImage(result.redirect, remaining - 1) : result.data || "";
}
async function loadImage(value: string): Promise<string> {
  try {
    const upload = /^\/api\/uploads\/([a-f0-9]{24}\.(?:png|jpg|webp|gif))$/.exec(value);
    if (upload) { const image = readStoredImage(upload[1]); return image ? `data:${image.type};base64,${image.bytes.toString("base64")}` : ""; }
    return /^https?:\/\//i.test(value) ? await remoteImage(value) : "";
  } catch { return ""; } // An unavailable optional image never prevents a CV download.
}
export async function preparePdfImages(portfolio: PortfolioInput): Promise<PortfolioInput> {
  const avatarUrl = await loadImage(portfolio.profile.avatarUrl);
  const projects = [];
  for (let i = 0; i < portfolio.projects.length; i += 3) {
    const batch = await Promise.all(portfolio.projects.slice(i, i + 3).map(async project => ({ ...project, imageUrl: await loadImage(project.imageUrl) })));
    projects.push(...batch);
  }
  return { ...portfolio, profile: { ...portfolio.profile, avatarUrl }, projects };
}
