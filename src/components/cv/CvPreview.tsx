"use client";
import { useLayoutEffect, useRef, useState } from "react";
import type { PortfolioInput } from "@/lib/validation/portfolio.schema";
import { CV_CSS, renderCvBody } from "@/lib/cv";
export default function CvPreview({ portfolio }: { portfolio: PortfolioInput }) {
  const container = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ scale: 0.4, height: 450 });
  useLayoutEffect(() => {
    if (!container.current || !sheet.current) return;
    const update = () => {
      if (!container.current || !sheet.current) return;
      const scale = Math.min(container.current.clientWidth / 794, 1);
      const height = Math.ceil(sheet.current.scrollHeight * scale);
      setSize(previous => previous.scale === scale && previous.height === height ? previous : { scale, height });
    };
    const observer = new ResizeObserver(update);
    observer.observe(container.current); observer.observe(sheet.current); update();
    return () => observer.disconnect();
  }, []);
  return <div className="cv-preview" ref={container} style={{ height: size.height }} aria-label="CV preview — your PDF uses this design"><style>{`@font-face{font-family:MyfolioCV;src:url('/fonts/Geist.woff2') format('woff2');font-weight:100 900;font-display:swap}${CV_CSS}`}</style><div className="cv-preview-sheet" ref={sheet} style={{ width: 794, transform: `scale(${size.scale})`, transformOrigin: "top left" }} dangerouslySetInnerHTML={{ __html: renderCvBody(portfolio) }} /></div>;
}
