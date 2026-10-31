"use client";
import Link from "next/link";
import type { PortfolioRecord } from "@/lib/db";
import { useT } from "@/components/LocaleProvider";
import Icon from "@/components/ui/Icon";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import CvPreview from "./CvPreview";
export default function CvPage({ portfolio }: { portfolio: PortfolioRecord }) {
  const t = useT(); const pdf = usePdfDownload(); const card = usePdfDownload("business-card");
  return <div className="cv-page"><div className="cv-page-toolbar"><Link href={`/p/${portfolio.slug}`}>← {portfolio.profile.fullName}</Link><div><button className="button button-secondary" type="button" disabled={card.status === "loading"} onClick={() => void card.download(portfolio.slug)}>{t(card.status === "loading" ? "card.preparing" : "card.download")}<Icon name="download" size={14} /></button><button className="button" type="button" disabled={pdf.status === "loading"} onClick={() => void pdf.download(portfolio.slug)}>{t(pdf.status === "loading" ? "editor.preparingPdf" : "editor.downloadPdf")}<Icon name="download" size={14} /></button></div></div>{pdf.error && <p className="error-banner" role="alert">{pdf.error}</p>}{card.error && <p className="error-banner" role="alert">{card.error}</p>}<CvPreview portfolio={portfolio} /><p className="cv-page-caption">{t("editor.pdfThemeNote")} <Link href={`/p/${portfolio.slug}/card`} className="text-link">{t("card.preview")}</Link></p></div>;
}
