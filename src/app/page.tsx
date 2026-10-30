"use client";
import Link from "next/link";
import { useState } from "react";
import { useT } from "@/components/LocaleProvider";
import Icon, { type IconName } from "@/components/ui/Icon";
import PortfolioPreview from "@/components/preview/PortfolioPreview";
import { demoPortfolio } from "@/lib/demo";
import { THEMES, type Theme } from "@/lib/validation/portfolio.schema";

export default function Home() {
  const t = useT();
  const [theme, setTheme] = useState<Theme>("minimal");
  return <div className="home">
    <section className="hero container">
      <div className="hero-copy"><div className="eyebrow"><span className="orange-dot" /> {t("home.eyebrow")}</div><h1>{t("home.title1")}<br />{t("home.title2")}<br /><em>{t("home.title3")}</em></h1><p className="hero-description">{t("home.description")}</p><div className="hero-actions"><Link href="/create" className="button">{t("home.cta")}<Icon name="arrow" size={18} /></Link><Link href="/p/demo-portfolio" className="text-link">{t("home.demo")}<Icon name="external" size={15} /></Link></div><div className="hero-reassurance"><span><Icon name="check" size={14} />{t("home.noCode")}</span><span><Icon name="check" size={14} />{t("home.noSignup")}</span><span><Icon name="check" size={14} />{t("home.yours")}</span></div></div>
      <div className="hero-visual"><div className="hero-grid" /><div className="preview-caption"><Icon name="spark" size={15} /> A SMALL PREVIEW. A BIG POSSIBILITY.</div><PortfolioPreview portfolio={{ ...demoPortfolio, theme }} browser /><div className="preview-floating"><span className="floating-icon"><Icon name="check" size={17} /></span><div><strong>Looks like you. Feels like you.</strong><span>Your story, beautifully put together.</span></div></div><div className="hero-theme-picker"><span>Make it yours</span><div role="group" aria-label="Preview theme">{THEMES.map(item => <button key={item} onClick={() => setTheme(item)} className={`theme-dot theme-${item} ${theme === item ? "selected" : ""}`} aria-label={`${item} preview`} aria-pressed={theme === item} />)}</div></div></div>
    </section>
    <section className="benefit-strip container" aria-label="Features">{([
      ["layout", "home.feature1", "home.feature1body"], ["globe", "home.feature2", "home.feature2body"], ["edit", "home.feature3", "home.feature3body"],
    ] as [IconName, string, string][]).map(([icon, title, body]) => <div key={icon}><span className="benefit-icon"><Icon name={icon} size={22} /></span><div><h2>{t(title)}</h2><p>{t(body)}</p></div></div>)}</section>
    <section id="templates" className="template-section container"><div className="section-heading"><div><span className="eyebrow">{t("home.templatesEyebrow")}</span><h2>{t("home.templatesTitle")} <em>{t("home.templatesAccent")}</em></h2></div><p>{t("home.templatesDescription")}</p></div><div className="template-grid">{THEMES.map((item, i) => <Link href={`/create?theme=${item}`} className={`template-card template-${item}`} key={item}><div className="template-image"><PortfolioPreview compact portfolio={{ ...demoPortfolio, theme: item }} />{i === 0 && <span className="template-badge">THE EVERYDAY FAVORITE</span>}</div><div className="template-info"><div><h3>{t(`wizard.review.theme.${item}`)}<span>0{i + 1}</span></h3><p>{t(`home.theme.${item}`)}</p></div><span className="template-arrow"><Icon name="arrow" size={19} /></span></div></Link>)}</div><p className="template-note"><Icon name="spark" size={13} /> {t("home.templatesNote")}</p></section>
    <section id="how-it-works" className="how-section"><div className="container how-inner"><div><span className="eyebrow">{t("home.howEyebrow")}</span><h2>{t("home.howTitle")}<br /><em>{t("home.howAccent")}</em></h2><p>{t("home.howDescription")}</p><Link href="/create" className="text-link">{t("home.cta")}<Icon name="arrow" size={17} /></Link></div><div className="how-steps">{[1, 2, 3].map(i => <div key={i}><span>0{i}</span><div><h3>{t(`home.step${i}`)}</h3><p>{t(`home.step${i}body`)}</p></div></div>)}</div></div></section>
    <section className="faq-section container"><div><span className="eyebrow">{t("home.faqEyebrow")}</span><h2>{t("home.faqTitle")}<em> {t("home.faqAccent")}</em></h2></div><div className="faq-list">{[1, 2, 3].map(i => <details key={i}><summary>{t(`home.question${i}`)}<Icon name="plus" size={18} /></summary><p>{t(`home.answer${i}`)}</p></details>)}</div></section>
    <section className="closing-section container"><span className="closing-star"><Icon name="spark" size={44} /></span><div><span className="eyebrow">{t("home.closingEyebrow")}</span><h2>{t("home.closingTitle")} <em>{t("home.closingAccent")}</em></h2></div><Link href="/create" className="button button-cream">{t("home.cta")}<Icon name="arrow" size={18} /></Link></section>
  </div>;
}
