"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { PortfolioRecord } from "@/lib/db";
import { useT } from "@/components/LocaleProvider";
import Icon from "@/components/ui/Icon";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import BusinessCardPreview from "./BusinessCardPreview";
const subscribe = () => () => {};
export default function BusinessCardPage({ portfolio }: { portfolio: PortfolioRecord }) {
  const t = useT(); const card = usePdfDownload("business-card");
  const origin = useSyncExternalStore(subscribe, () => window.location.origin, () => "");
  const publicUrl = origin ? `${origin}/p/${portfolio.slug}` : "";
  return <div className="business-card-page"><div className="business-card-toolbar"><Link href={`/p/${portfolio.slug}`}>← {portfolio.profile.fullName}</Link><div><Link className="button button-secondary" href={`/p/${portfolio.slug}/cv`}>{t("editor.previewCv")}</Link><button className="button" type="button" disabled={card.status === "loading"} onClick={() => void card.download(portfolio.slug)}>{t(card.status === "loading" ? "card.preparing" : "card.download")}<Icon name="download" size={14} /></button></div></div><div className="business-card-heading"><span className="eyebrow">{t("card.eyebrow")}</span><h1>{t("card.title")}</h1><p>{t("card.description")}</p></div>{card.error && <p className="error-banner" role="alert">{card.error}</p>}<BusinessCardPreview portfolio={portfolio} publicUrl={publicUrl} sideBySide /><p className="business-card-caption">{t("card.dimensions")}</p><p className="pdf-status" role="status">{card.status === "success" ? t("card.ready") : ""}</p></div>;
}
