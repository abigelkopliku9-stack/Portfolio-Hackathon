"use client";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getLocalPortfolios, LIBRARY_EVENT } from "@/lib/localPortfolios";
import { useT } from "@/components/LocaleProvider";
import { Input, Button } from "@/components/ui/FormControls";
import Icon from "@/components/ui/Icon";
function subscribe(callback: () => void) { window.addEventListener("storage", callback); window.addEventListener(LIBRARY_EVENT, callback); return () => { window.removeEventListener("storage", callback); window.removeEventListener(LIBRARY_EVENT, callback); }; }
function snapshot() { try { return localStorage.getItem("portfolio-library-v1") || ""; } catch { return ""; } }
export default function LibraryPage() {
  const t = useT(); const router = useRouter();
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const items = raw ? getLocalPortfolios() : [];
  const [existing, setExisting] = useState(""); const [error, setError] = useState("");
  function openExisting(e: React.FormEvent) {
    e.preventDefault(); let slug = existing.trim();
    if (/^https?:\/\//i.test(slug)) { try { const url = new URL(slug); slug = url.pathname.replace(/^\/(?:p|dashboard)\//, "").replace(/\/$/, ""); } catch { setError(t("library.invalidLink")); return; } }
    slug = slug.replace(/^\/?(?:p|dashboard)\//, "").replace(/\/$/, "");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) { setError(t("library.invalidLink")); return; }
    router.push(`/dashboard/${slug}`);
  }
  return <div className="container library-page"><div className="page-heading"><div><span className="eyebrow"><Icon name="folder" size={13} />{t("library.eyebrow")}</span><h1>{t("nav.portfolios")}</h1><p>{t("library.subtitle")}</p></div><Link href="/create" className="button">{t("nav.create")}<Icon name="plus" size={16} /></Link></div><div className="library-top"><p>{t("library.browserNote")}</p><span>{items.length} {t("library.portfolios")}</span></div>{items.length ? <div className="library-grid">{items.map(p => <article className="library-card" key={p.slug}><div className="review-avatar">{p.fullName.split(" ").slice(0, 2).map(n => n[0]).join("")}</div><h2>{p.fullName}</h2><p>{p.headline}</p><span><Icon name="layout" size={12} />{t(`wizard.review.theme.${p.theme}`)}</span><div className="success-actions"><Link className="button" href={`/dashboard/${p.slug}`}>{t("library.edit")}<Icon name="edit" size={12} /></Link><Link className="button button-secondary" href={`/p/${p.slug}`}>{t("library.view")}<Icon name="external" size={12} /></Link></div></article>)}</div> : <div className="library-empty"><Icon name="folder" size={42} /><h2>{t("library.emptyTitle")}</h2><p>{t("library.emptyBody")}</p><Link className="button" href="/create">{t("home.cta")}<Icon name="arrow" size={15} /></Link></div>}<section className="open-existing"><h2>{t("library.existingTitle")}</h2><p>{t("library.existingBody")}</p><form onSubmit={openExisting}><Input aria-label={t("library.linkLabel")} value={existing} onChange={e => { setExisting(e.target.value); setError(""); }} placeholder="your-name-abcd or a portfolio link" required /><Button type="submit" variant="secondary">{t("library.open")}<Icon name="arrow" size={14} /></Button></form>{error && <p className="field-error" role="alert">{error}</p>}</section></div>;
}
