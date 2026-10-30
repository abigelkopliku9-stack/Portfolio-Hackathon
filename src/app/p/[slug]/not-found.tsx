import Link from "next/link";
import { t } from "@/lib/i18n";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f5f0e6] text-center">
      <h1 className="text-3xl font-bold text-[#1f3a1f]">{t("notfound.title")}</h1>
      <p className="text-[#5a5a5a]">{t("notfound.body")}</p>
      <Link href="/" className="rounded-full bg-[#1f3a1f] px-5 py-2 text-sm font-semibold text-[#f5f0e6] hover:bg-[#2d5a27]">
        {t("notfound.home")}
      </Link>
    </div>
  );
}
