"use client";
import { useLayoutEffect, useRef, useState } from "react";
import type { PortfolioInput } from "@/lib/validation/portfolio.schema";
import { BUSINESS_CARD_CSS, BUSINESS_CARD_WIDTH, renderBusinessCardFaces } from "@/lib/businessCard";
import { useT } from "@/components/LocaleProvider";
function CardFace({ html, label }: { html: string; label: string }) {
  const container = useRef<HTMLDivElement>(null); const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    if (!container.current) return;
    const update = () => { if (container.current) setScale(container.current.clientWidth / BUSINESS_CARD_WIDTH); };
    const observer = new ResizeObserver(update); observer.observe(container.current); update();
    return () => observer.disconnect();
  }, []);
  return <div className="business-card-face"><span className="business-card-side-label">{label}</span><div className="business-card-frame" ref={container}><div className="business-card-scaled" style={{ transform: `scale(${scale})` }} dangerouslySetInnerHTML={{ __html: html }} /></div></div>;
}
export default function BusinessCardPreview({ portfolio, publicUrl = "", sideBySide = false }: { portfolio: PortfolioInput; publicUrl?: string; sideBySide?: boolean }) {
  const t = useT(); const [front, back] = renderBusinessCardFaces(portfolio, publicUrl);
  return <div className={`business-card-pair ${sideBySide ? "business-card-pair-wide" : ""}`}><style>{`@font-face{font-family:MyfolioCard;src:url('/fonts/Geist.woff2') format('woff2');font-weight:100 900;font-display:swap}${BUSINESS_CARD_CSS}`}</style><CardFace html={front} label={t("card.front")} /><CardFace html={back} label={t("card.back")} /></div>;
}
