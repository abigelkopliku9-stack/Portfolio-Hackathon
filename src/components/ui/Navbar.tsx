"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n";

export default function Navbar() {
  const { t, locale, setLocale } = useLocale();
  return (
    <header className="sticky top-0 z-40 border-b border-[#1f3a1f]/20 bg-[#1f3a1f]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-[#f5f0e6]">
          {t("brand.name")}
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/" className="rounded-full px-3 py-1.5 text-[#f5f0e6] transition hover:bg-white/10">
            {t("nav.home")}
          </Link>
          <Link href="/p/demo-portfolio" className="hidden rounded-full px-3 py-1.5 text-[#f5f0e6] transition hover:bg-white/10 sm:inline">
            {t("nav.demo")}
          </Link>
          <Link href="/create" className="rounded-full bg-[#f5f0e6] px-4 py-1.5 font-medium text-[#1f3a1f] transition hover:bg-white">
            {t("nav.create")}
          </Link>
          <select
            aria-label={t("language.label")}
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="rounded-full border border-white/20 bg-white/10 px-2 py-1.5 text-xs text-[#f5f0e6] focus:outline-none"
          >
            {LOCALES.map((l) => (
              <option key={l} value={l} className="text-[#1a1a1a]">
                {LOCALE_LABELS[l]}
              </option>
            ))}
          </select>
        </div>
      </nav>
    </header>
  );
}
