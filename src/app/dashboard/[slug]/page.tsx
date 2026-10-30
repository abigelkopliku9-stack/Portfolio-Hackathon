"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import PortfolioWizard from "@/components/form/PortfolioWizard";
import { Button, Card, Field, Input } from "@/components/ui/FormControls";
import { useT } from "@/components/LocaleProvider";
import type { PortfolioRecord } from "@/lib/db";
import Icon from "@/components/ui/Icon";
import { rememberPortfolio } from "@/lib/localPortfolios";
export default function DashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  return <Dashboard key={slug} slug={slug} />;
}
function Dashboard({ slug }: { slug: string }) {
  const t = useT(); const [key, setKey] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const [data, setData] = useState<{ portfolio: PortfolioRecord; editKey: string } | null>(null);
  async function unlock(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch(`/api/portfolios/${slug}/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ editKey: key.trim() }) });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || t("dashboard.unlock.error"));
      setData({ portfolio: json.portfolio, editKey: key.trim() });
      rememberPortfolio({ slug, fullName: json.portfolio.profile.fullName, headline: json.portfolio.profile.headline, theme: json.portfolio.theme, updatedAt: json.portfolio.updatedAt });
    } catch (e) { setError(e instanceof Error ? e.message : t("dashboard.unlock.error")); } finally { setLoading(false); }
  }
  if (data) return <div className="container editor-page"><PortfolioWizard mode="edit" initialValues={data.portfolio} slug={slug} editKey={data.editKey} /></div>;
  return <div className="unlock-section"><Card><div className="unlock-icon"><Icon name="lock" size={21} /></div><h1>{t("dashboard.unlock.title")}</h1><p>{t("dashboard.unlock.subtitle").replace("{slug}", slug)}</p><form onSubmit={unlock}><Field label={t("dashboard.unlock.key")}><Input value={key} onChange={e => setKey(e.target.value)} placeholder={t("dashboard.unlock.key.placeholder")} autoFocus type="password" autoComplete="off" required /></Field>{error && <div className="error-banner" role="alert">{error}</div>}<Button type="submit" disabled={loading || !key.trim()}>{t(loading ? "dashboard.unlock.checking" : "dashboard.unlock.button")}<Icon name="arrow" size={16} /></Button></form></Card><Link href="/dashboard">← {t("nav.portfolios")}</Link></div>;
}
