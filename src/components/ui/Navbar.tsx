"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n";
import Icon from "./Icon";
import BrandMark from "./BrandMark";
import "@/components/auth/auth.css";
export default function Navbar() {
  const { locale, setLocale, t } = useLocale();
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  // Re-check who is logged in whenever the page changes (e.g. right after logging in).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setUser(d?.user ?? null); })
      .catch(() => { if (!cancelled) setUser(null); });
    return () => { cancelled = true; };
  }, [path]);
  async function logout() {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    setUser(null);
    router.push("/");
    router.refresh();
  }
  if (path.startsWith("/p/")) return null;
  return <header className="site-header"><nav className="site-nav container" aria-label="Main navigation">
    <Link href="/" className="brand" aria-label="Myfolio Generator home"><BrandMark /><span>Myfolio<span className="brand-light"> Generator</span><span className="brand-period">.</span></span></Link>
    <div className="nav-middle"><Link href="/#templates">{t("nav.templates")}</Link><Link href="/#how-it-works">{t("nav.how")}</Link></div>
    <div className="nav-actions"><Link className={`nav-library ${path.startsWith("/dashboard") ? "active" : ""}`} href="/dashboard"><Icon name="folder" size={16} /><span>{t("nav.portfolios")}</span></Link>{user ? <><span className="nav-user">{user.name}</span><button type="button" className="nav-auth" onClick={logout}>Log out</button></> : <Link className="nav-auth" href="/login">Log in</Link>}<select aria-label={t("language.label")} value={locale} onChange={e => setLocale(e.target.value as Locale)} className="locale-select">{LOCALES.map(l => <option key={l} value={l}>{LOCALE_LABELS[l]}</option>)}</select><Link href="/create" className="button button-small">{t("nav.create")}<Icon name="plus" size={16} /></Link></div>
  </nav></header>;
}
