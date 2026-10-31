"use client";
import Link from "next/link";
import type { PortfolioRecord } from "@/lib/db";
import { useT } from "@/components/LocaleProvider";
import Icon from "@/components/ui/Icon";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import CvPreview from "./CvPreview";
export default function CvPage({ portfolio }: { portfolio: PortfolioRecord }) {
  const t = useT(); const pdf = usePdfDownload();
  return <div className="cv-page"><div className="cv-page-toolbar"><Link href={`/p/${portfolio.slug}`}>← {portfolio.profile.fullName}</Link><div><button className="button" type="button" disabled={pdf.status === "loading"} onClick={() => void pdf.download(portfolio.slug)}>{t(pdf.status === "loading" ? "editor.preparingPdf" : "editor.downloadPdf")}<Icon name="download" size={14} /></button></div></div>{pdf.error && <p className="error-banner" role="alert">{pdf.error}</p>}<CvPreview portfolio={portfolio} /><p className="cv-page-caption">{t("editor.pdfThemeNote")}</p></div>;
}
