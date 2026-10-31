import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  devIndicators: false,
  serverExternalPackages: ["puppeteer"],
  outputFileTracingIncludes: { "/api/portfolios/*/export*": ["./public/fonts/Geist.woff2", "./.cache/puppeteer/**/*"] },
};
export default nextConfig;
