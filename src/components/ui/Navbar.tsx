"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n";
import Icon from "./Icon";
export default function Navbar() {
  const { locale, setLocale, t } = useLocale();
  const path = usePathname();
  if (path.startsWith("/p/")) return null;
  return <header className="site-header"><nav className="site-nav container" aria-label="Main navigation">
    <Link href="/" className="brand"><span className="brand-mark"><Icon name="spark" size={22} /></span><span>Portfolio<span className="brand-light"> Generator</span><span className="brand-period">.</span></span></Link>
    <div className="nav-middle"><Link href="/#templates">{t("nav.templates")}</Link><Link href="/#how-it-works">{t("nav.how")}</Link></div>
    <div className="nav-actions"><Link className={`nav-library ${path.startsWith("/dashboard") ? "active" : ""}`} href="/dashboard"><Icon name="folder" size={16} /><span>{t("nav.portfolios")}</span></Link><select aria-label={t("language.label")} value={locale} onChange={e => setLocale(e.target.value as Locale)} className="locale-select">{LOCALES.map(l => <option key={l} value={l}>{LOCALE_LABELS[l]}</option>)}</select><Link href="/create" className="button button-small">{t("nav.create")}<Icon name="plus" size={16} /></Link></div>
  </nav></header>;
}
