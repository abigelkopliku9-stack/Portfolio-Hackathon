"use client";

import PortfolioWizard from "@/components/form/PortfolioWizard";
import { useT } from "@/components/LocaleProvider";

export default function CreatePage() {
  const t = useT();
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-[#1f3a1f]">{t("create.title")}</h1>
        <p className="mt-2 text-[#5a5a5a]">{t("create.subtitle")}</p>
      </div>
      <PortfolioWizard mode="create" />
    </div>
  );
}
