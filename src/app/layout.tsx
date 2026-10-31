import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import HelpAssistant from "@/components/help/HelpAssistant";
import { LocaleProvider } from "@/components/LocaleProvider";

const geist = localFont({ src: "./fonts/Geist.woff2", variable: "--font-geist-sans", display: "swap", weight: "100 900" });
const mono = localFont({ src: "./fonts/GeistMono.woff2", variable: "--font-geist-mono", display: "swap", weight: "100 900" });
export const metadata: Metadata = {
  title: { default: "Myfolio — A home for your work", template: "%s | Myfolio" },
  icons: { icon: "/myfolio-icon.svg", shortcut: "/myfolio-icon.svg" },
  description: "Your work deserves a place of its own. Create, customize, and share a beautiful portfolio. No coding required.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${geist.variable} ${mono.variable}`}><body>
    <LocaleProvider><a className="skip-link" href="#main-content">Skip to content</a><Navbar /><main id="main-content" className="app-main">{children}</main><Footer /><HelpAssistant /></LocaleProvider>
  </body></html>;
}
