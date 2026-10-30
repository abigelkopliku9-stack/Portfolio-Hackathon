"use client";

import styles from "./portfolio.module.css";
import type { PortfolioRecord } from "@/lib/db";
import { useT } from "@/components/LocaleProvider";

export function PortfolioView({ portfolio }: { portfolio: PortfolioRecord }) {
  const t = useT();
  const p = portfolio.profile;
  return (
    <div className={styles.shell} data-theme={portfolio.theme}>
      <div className={styles.document}>
        <header className={styles.header}>
          {p.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatarUrl} alt={p.fullName} className={styles.avatar} />
          )}
          <div className={styles.headerText}>
            <h1 className={styles.name}>{p.fullName}</h1>
            <p className={styles.headline}>{p.headline}</p>
            <div className={styles.contactRow}>
              {p.location && <span className={styles.contactItem}>📍 {p.location}</span>}
              {p.email && (
                <a href={`mailto:${p.email}`} className={styles.contactItem}>
                  ✉ {p.email}
                </a>
              )}
              {portfolio.socials.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactItem}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </header>

        <div className={styles.body}>
          <section className={styles.section}>
            <div className={styles.sectionLabel}>{t("portfolio.section.about")}</div>
            <div className={styles.sectionContent}>
              <p className={styles.prose}>{p.bio}</p>
            </div>
          </section>

          {portfolio.experience.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionLabel}>{t("portfolio.section.experience")}</div>
              <div className={styles.sectionContent}>
                {portfolio.experience.map((e, i) => (
                  <div key={i} className={styles.expItem}>
                    <div>
                      <div className={styles.expHead}>
                        <span className={styles.expTitle}>{e.role}</span>
                        <span className={styles.expDate}>
                          {e.startDate} – {e.current ? "Present" : e.endDate}
                        </span>
                      </div>
                      <div className={styles.expCompany}>{e.company}</div>
                      {e.location && <p className={styles.expMeta}>{e.location}</p>}
                      {e.highlights.length > 0 && (
                        <ul className={styles.bullets}>
                          {e.highlights.map((h, j) => (
                            <li key={j}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {portfolio.projects.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionLabel}>{t("portfolio.section.projects")}</div>
              <div className={styles.sectionContent}>
                {portfolio.projects.map((proj, i) => (
                  <div key={i} className={styles.card}>
                    <div className={styles.cardHead}>
                      <span className={styles.cardTitle}>{proj.title}</span>
                      {proj.featured && <span className={styles.featured}>{t("portfolio.featured")}</span>}
                    </div>
                    <p className={styles.cardBody}>{proj.description}</p>
                    {proj.techTags.length > 0 && (
                      <div className={styles.tagRow}>
                        {proj.techTags.map((t) => (
                          <span key={t} className={styles.tag}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {(proj.repoUrl || proj.liveUrl) && (
                      <div className={styles.linkRow}>
                        {proj.repoUrl && (
                          <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer">
                            {t("portfolio.code")}
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer">
                            {t("portfolio.live")}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {portfolio.skills.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionLabel}>{t("portfolio.section.skills")}</div>
              <div className={styles.sectionContent}>
                <div className={styles.skillList}>
                  {portfolio.skills.map((s, i) => (
                    <span key={i} className={styles.skillPill}>
                      {s.name}
                      {s.category ? ` · ${s.category}` : ""}
                      <span className={styles.skillStars}>{"★".repeat(s.level)}</span>
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {portfolio.events.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionLabel}>{t("portfolio.section.events")}</div>
              <div className={styles.sectionContent}>
                {portfolio.events.map((ev, i) => (
                  <div key={i} className={styles.card}>
                    <div className={styles.cardHead}>
                      <span className={styles.cardTitle}>{ev.title}</span>
                      {ev.date && <span className={styles.cardMeta}>{ev.date}</span>}
                    </div>
                    {ev.role && <p className={styles.eventRole}>{ev.role}</p>}
                    {ev.description && <p className={styles.eventBody}>{ev.description}</p>}
                    {ev.url && (
                      <a href={ev.url} target="_blank" rel="noopener noreferrer" className={styles.eventLink}>
                        {t("portfolio.link")}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {portfolio.awards.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionLabel}>{t("portfolio.section.awards")}</div>
              <div className={styles.sectionContent}>
                {portfolio.awards.map((a, i) => (
                  <div key={i} className={styles.card}>
                    <div className={styles.cardHead}>
                      <span className={styles.cardTitle}>{a.title}</span>
                      {a.date && <span className={styles.cardMeta}>{a.date}</span>}
                    </div>
                    {(a.issuer || a.result) && (
                      <p className={styles.eventRole}>
                        {a.issuer}
                        {a.issuer && a.result ? " · " : ""}
                        {a.result}
                      </p>
                    )}
                    {a.description && <p className={styles.eventBody}>{a.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <footer className={styles.footer}>
            {t("portfolio.footer")}{" "}
            <span className="mx-2">· {portfolio.views} {t("portfolio.views")}</span>
            <button
              onClick={() => window.print()}
              className="mx-2 inline-flex items-center rounded-full border border-[#1f3a1f]/30 px-3 py-1 text-xs font-semibold text-[#1f3a1f] transition hover:bg-[#e6efe6]"
            >
              Print / PDF
            </button>
            <a
              href={`/api/portfolios/${portfolio.slug}/export`}
              className="inline-flex items-center rounded-full bg-[#1f3a1f] px-4 py-1.5 text-xs font-semibold text-[#f5f0e6] transition hover:bg-[#2d5a27]"
            >
              {t("portfolio.export")}
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
