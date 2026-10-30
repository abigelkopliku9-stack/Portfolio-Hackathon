"use client";

import Link from "next/link";
import { useT } from "@/components/LocaleProvider";

export default function Footer() {
  const t = useT();
  return (
    <footer className="mt-auto border-t border-[#1f3a1f]/15 bg-[#1f3a1f]/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-[#1f3a1f]">
            {t("brand.name")}
          </span>
          <span className="text-xs text-[#5a5a5a]">· Hackathon MVP</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#5a5a5a]">
          <Link href="/" className="transition hover:text-[#1f3a1f]">
            {t("nav.home")}
          </Link>
          <Link href="/p/demo-portfolio" className="transition hover:text-[#1f3a1f]">
            {t("nav.demo")}
          </Link>
          <Link href="/create" className="transition hover:text-[#1f3a1f]">
            {t("nav.create")}
          </Link>
        </nav>
        <p className="text-xs text-[#5a5a5a]">
          © {new Date().getFullYear()} {t("brand.name")}
        </p>
      </div>
    </footer>
  );
}
