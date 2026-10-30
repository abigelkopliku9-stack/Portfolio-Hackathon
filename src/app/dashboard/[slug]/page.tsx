"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import PortfolioWizard from "@/components/form/PortfolioWizard";
import { Button, Card, Field, Input } from "@/components/ui/FormControls";
import { useT } from "@/components/LocaleProvider";
import type { PortfolioInput } from "@/lib/validation/portfolio.schema";
import type { PortfolioRecord } from "@/lib/db";

export default function DashboardPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const t = useT();

  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ portfolio: PortfolioRecord; editKey: string } | null>(null);

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolios/${slug}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editKey: key }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? t("dashboard.unlock.error"));
        return;
      }
      setData({ portfolio: json.portfolio as PortfolioRecord, editKey: key });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  if (data) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-bold">{t("dashboard.title")}</h1>
        <p className="mb-2 text-[#5a5a5a]">{t("dashboard.subtitle")}</p>
        <p className="mb-8 text-sm text-[#5a5a5a]">
          {data.portfolio.profile.fullName} · {data.portfolio.views ?? 0} {t("portfolio.views")}
        </p>
        <PortfolioWizard mode="edit" initialValues={data.portfolio} slug={slug} editKey={data.editKey} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <Card>
        <h1 className="mb-2 text-2xl font-bold">{t("dashboard.unlock.title")}</h1>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          {t("dashboard.unlock.subtitle").replace("{slug}", slug)}
        </p>
        <form onSubmit={unlock} className="space-y-4">
          <Field label={t("dashboard.unlock.key")}>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={t("dashboard.unlock.key.placeholder")}
              autoFocus
            />
          </Field>
          {error && (
            <div className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-200">
              {error}
            </div>
          )}
          <Button type="submit" disabled={loading || !key.trim()}>
            {loading ? t("dashboard.unlock.checking") : t("dashboard.unlock.button")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
