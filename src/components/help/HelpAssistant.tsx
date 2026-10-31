"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useT } from "@/components/LocaleProvider";
import Icon from "@/components/ui/Icon";
import BrandMark from "@/components/ui/BrandMark";
import styles from "./help.module.css";
const FAQS = ["start", "pdf", "theme", "edit", "photo", "share", "trouble"];
export default function HelpAssistant() {
  const t = useT(); const path = usePathname();
  const [open, setOpen] = useState(false); const [query, setQuery] = useState(""); const [expanded, setExpanded] = useState<string | null>(null);
  const launcher = useRef<HTMLButtonElement>(null); const search = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); launcher.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  const visible = FAQS.filter(id => `${t(`help.${id}.question`)} ${t(`help.${id}.answer`)}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));
  if (path.startsWith("/p/")) return null;
  function close() { setOpen(false); launcher.current?.focus(); }
  return <div className={styles.widget}>{open && <section className={styles.panel} id="myfolio-help" role="dialog" aria-label={t("help.title")} aria-modal="false"><header className={styles.header}><BrandMark size={31} /><div><h2>{t("help.title")}</h2><p>{t("help.subtitle")}</p></div><button type="button" onClick={close} aria-label={t("help.close")}><Icon name="close" size={18} /></button></header><div className={styles.intro}><span className={styles.hello}><Icon name="spark" size={15} />{t("help.greeting")}</span><p>{t("help.intro")}</p></div><div className={styles.search}><Icon name="search" size={16} /><input ref={search} type="search" value={query} onChange={event => { setQuery(event.target.value); setExpanded(null); }} placeholder={t("help.search")} aria-label={t("help.search")} /></div><div className={styles.faqs}><p className={styles.label}>{t("help.faqLabel")}</p>{visible.length ? visible.map(id => <article key={id} className={styles.faq}><h3><button type="button" aria-expanded={expanded === id} aria-controls={`faq-${id}`} onClick={() => setExpanded(previous => previous === id ? null : id)}><span>{t(`help.${id}.question`)}</span><Icon name="plus" size={15} className={expanded === id ? styles.rotated : ""} /></button></h3>{(expanded === id) && <p id={`faq-${id}`}>{t(`help.${id}.answer`)}</p>}</article>) : <div className={styles.noResults}><Icon name="search" size={24} /><p>{t("help.noResults")}</p><button type="button" onClick={() => setQuery("")}>{t("help.clearSearch")}</button></div>}</div><footer className={styles.footer}><Link href="/create" onClick={close}>{t("home.cta")}<Icon name="arrow" size={13} /></Link><span>{t("help.footer")}</span></footer></section>}<button type="button" ref={launcher} className={`${styles.launcher} ${open ? styles.isOpen : ""}`} aria-expanded={open} aria-controls="myfolio-help" aria-label={open ? t("help.close") : t("help.open")} onClick={() => setOpen(previous => !previous)}><Icon name={open ? "close" : "chat"} size={21} /><span>{t("help.launcher")}</span>{!open && <i />}</button></div>;
}
