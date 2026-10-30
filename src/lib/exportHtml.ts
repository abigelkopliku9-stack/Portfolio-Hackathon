import type { PortfolioRecord } from "@/lib/db";

const CSS = `
* { box-sizing: border-box; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
.pf-shell { min-height: 100vh; background: #e8e2d6; padding: 2.5rem 1rem; color: #1a1a1a; }
.pf-shell[data-theme="minimal"] { --bg:#f5f0e6; --fg:#1a1a1a; --muted:#5a5a5a; --accent:#1f3a1f; --accent-soft:#e6efe6; --border:#d9d2c3; --card:#fff; --headbg:#1f3a1f; --headfg:#f5f0e6; }
.pf-shell[data-theme="dark"] { --bg:#1a1a1a; --fg:#f5f0e6; --muted:#a8a8a8; --accent:#6ee7a0; --accent-soft:#1f3a1f; --border:#2a2a2a; --card:#242424; --headbg:#0f1f0f; --headfg:#e6efe6; }
.pf-shell[data-theme="playful"] { --bg:#faf6f0; --fg:#1a1a1a; --muted:#6b7280; --accent:#2d5a27; --accent-soft:#eaf2ea; --border:#e5ddd0; --card:#fff; --headbg:#2d5a27; --headfg:#faf6f0; }
.pf-document { max-width: 52rem; margin: 0 auto; background: var(--bg); box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.06); border-radius: 6px; overflow: hidden; }
.pf-header { background: var(--headbg); color: var(--headfg); padding: 2rem 2rem 1.75rem; display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
.pf-avatar { width: 6rem; height: 6rem; border-radius: 9999px; object-fit: cover; border: 3px solid rgba(255,255,255,0.5); flex-shrink: 0; }
.pf-headertext { flex: 1; min-width: 0; }
.pf-name { font-size: 2rem; font-weight: 800; letter-spacing: -0.01em; line-height: 1.1; }
.pf-headline { margin-top: 0.3rem; font-size: 1.05rem; opacity: 0.9; font-weight: 500; }
.pf-contactrow { margin-top: 0.85rem; display: flex; flex-wrap: wrap; gap: 0.4rem 1.25rem; font-size: 0.85rem; opacity: 0.95; }
.pf-contactrow a { color: inherit; text-decoration: none; border-bottom: 1px solid transparent; }
.pf-contactrow a:hover { border-bottom-color: currentColor; }
.pf-contactitem { display: inline-flex; align-items: center; gap: 0.3rem; }
.pf-body { padding: 1.75rem 2rem 2.5rem; }
.pf-section { display: grid; grid-template-columns: 1fr; gap: 0.5rem; margin-bottom: 1.75rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
.pf-section:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
@media (min-width: 640px) { .pf-section { grid-template-columns: 8.5rem 1fr; gap: 1.25rem; } }
.pf-sectionlabel { font-size: 0.8rem; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 0.06em; padding-top: 0.2rem; line-height: 1.2; }
.pf-sectioncontent { min-width: 0; }
.pf-prose { line-height: 1.7; white-space: pre-line; }
.pf-expitem { padding-bottom: 1rem; margin-bottom: 1rem; border-bottom: 1px dashed var(--border); }
.pf-expitem:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.pf-exphead { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0.5rem; }
.pf-exptitle { font-weight: 700; }
.pf-expdate { font-size: 0.8rem; color: var(--muted); font-weight: 600; }
.pf-expcompany { font-size: 0.85rem; color: var(--accent); font-weight: 600; margin-top: 0.1rem; }
.pf-expmeta { font-size: 0.8rem; color: var(--muted); margin-top: 0.1rem; }
.pf-bullets { margin-top: 0.4rem; padding-left: 1.1rem; font-size: 0.9rem; line-height: 1.6; }
.pf-bullets li { margin-bottom: 0.25rem; }
.pf-card { border: 1px solid var(--border); background: var(--card); border-radius: 0.5rem; padding: 0.85rem 1rem; margin-bottom: 0.75rem; }
.pf-cardhead { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0.5rem; }
.pf-cardtitle { font-weight: 700; }
.pf-cardmeta { font-size: 0.8rem; color: var(--muted); }
.pf-cardbody { margin-top: 0.3rem; font-size: 0.9rem; color: var(--muted); line-height: 1.6; }
.pf-tagrow { margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.35rem; }
.pf-tag { border-radius: 0.25rem; background: var(--accent-soft); color: var(--accent); padding: 0.15rem 0.5rem; font-size: 0.75rem; font-weight: 600; }
.pf-linkrow { margin-top: 0.5rem; display: flex; gap: 0.75rem; font-size: 0.8rem; }
.pf-linkrow a { color: var(--accent); text-decoration: none; font-weight: 600; }
.pf-featured { border-radius: 0.25rem; background: var(--accent); color: #fff; font-size: 0.65rem; padding: 0.1rem 0.4rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.pf-eventrole { font-size: 0.8rem; color: var(--muted); margin-top: 0.1rem; }
.pf-eventbody { margin-top: 0.3rem; font-size: 0.9rem; color: var(--muted); line-height: 1.6; }
.pf-eventlink { display: inline-block; margin-top: 0.35rem; font-size: 0.8rem; color: var(--accent); text-decoration: none; font-weight: 600; }
.pf-skilllist { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.pf-skillpill { display: inline-flex; align-items: center; gap: 0.3rem; border-radius: 0.375rem; background: var(--accent-soft); color: var(--accent); padding: 0.3rem 0.7rem; font-size: 0.85rem; font-weight: 600; }
.pf-skillstars { color: var(--accent); font-size: 0.75rem; opacity: 0.8; }
.pf-footer { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border); text-align: center; font-size: 0.75rem; color: var(--muted); }
.pf-footer a { color: var(--accent); text-decoration: none; font-weight: 600; }
`;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderPortfolioHtml(portfolio: PortfolioRecord): string {
  const p = portfolio.profile;
  const sections: string[] = [];

  sections.push(`
  <section class="pf-section">
    <div class="pf-sectionlabel">About</div>
    <div class="pf-sectioncontent">
      <p class="pf-prose">${esc(p.bio)}</p>
    </div>
  </section>`);

  if (portfolio.experience.length) {
    sections.push(`
  <section class="pf-section">
    <div class="pf-sectionlabel">Work experience</div>
    <div class="pf-sectioncontent">
      ${portfolio.experience
        .map(
          (e) => `
      <div class="pf-expitem">
        <div class="pf-exphead">
          <span class="pf-exptitle">${esc(e.role)}</span>
          <span class="pf-expdate">${esc(e.startDate)} – ${e.current ? "Present" : esc(e.endDate)}</span>
        </div>
        <div class="pf-expcompany">${esc(e.company)}</div>
        ${e.location ? `<p class="pf-expmeta">${esc(e.location)}</p>` : ""}
        ${
          e.highlights.length
            ? `<ul class="pf-bullets">${e.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`
            : ""
        }
      </div>`,
        )
        .join("")}
    </div>
  </section>`);
  }

  if (portfolio.projects.length) {
    sections.push(`
  <section class="pf-section">
    <div class="pf-sectionlabel">Projects</div>
    <div class="pf-sectioncontent">
      ${portfolio.projects
        .map(
          (proj) => `
      <div class="pf-card">
        <div class="pf-cardhead">
          <span class="pf-cardtitle">${esc(proj.title)}</span>
          ${proj.featured ? `<span class="pf-featured">Featured</span>` : ""}
        </div>
        <p class="pf-cardbody">${esc(proj.description)}</p>
        ${
          proj.techTags.length
            ? `<div class="pf-tagrow">${proj.techTags.map((t) => `<span class="pf-tag">${esc(t)}</span>`).join("")}</div>`
            : ""
        }
        ${(proj.repoUrl || proj.liveUrl) ? `<div class="pf-linkrow">
          ${proj.repoUrl ? `<a href="${esc(proj.repoUrl)}" target="_blank" rel="noopener noreferrer">Code</a>` : ""}
          ${proj.liveUrl ? `<a href="${esc(proj.liveUrl)}" target="_blank" rel="noopener noreferrer">Live</a>` : ""}
        </div>` : ""}
      </div>`,
        )
        .join("")}
    </div>
  </section>`);
  }

  if (portfolio.skills.length) {
    sections.push(`
  <section class="pf-section">
    <div class="pf-sectionlabel">Skills</div>
    <div class="pf-sectioncontent">
      <div class="pf-skilllist">
        ${portfolio.skills
          .map(
            (s) =>
              `<span class="pf-skillpill">${esc(s.name)}${
                s.category ? ` · ${esc(s.category)}` : ""
              } <span class="pf-skillstars">${"★".repeat(s.level)}</span></span>`,
          )
          .join("")}
      </div>
    </div>
  </section>`);
  }

  if (portfolio.events.length) {
    sections.push(`
  <section class="pf-section">
    <div class="pf-sectionlabel">Events</div>
    <div class="pf-sectioncontent">
      ${portfolio.events
        .map(
          (ev) => `
      <div class="pf-card">
        <div class="pf-cardhead">
          <span class="pf-cardtitle">${esc(ev.title)}</span>
          ${ev.date ? `<span class="pf-cardmeta">${esc(ev.date)}</span>` : ""}
        </div>
        ${ev.role ? `<p class="pf-eventrole">${esc(ev.role)}</p>` : ""}
        ${ev.description ? `<p class="pf-eventbody">${esc(ev.description)}</p>` : ""}
        ${ev.url ? `<a class="pf-eventlink" href="${esc(ev.url)}" target="_blank" rel="noopener noreferrer">Link →</a>` : ""}
      </div>`,
        )
        .join("")}
    </div>
  </section>`);
  }

  if (portfolio.awards.length) {
    sections.push(`
  <section class="pf-section">
    <div class="pf-sectionlabel">Awards</div>
    <div class="pf-sectioncontent">
      ${portfolio.awards
        .map(
          (a) => `
      <div class="pf-card">
        <div class="pf-cardhead">
          <span class="pf-cardtitle">${esc(a.title)}</span>
          ${a.date ? `<span class="pf-cardmeta">${esc(a.date)}</span>` : ""}
        </div>
        ${(a.issuer || a.result) ? `<p class="pf-eventrole">${esc(a.issuer)}${a.issuer && a.result ? " · " : ""}${esc(a.result)}</p>` : ""}
        ${a.description ? `<p class="pf-eventbody">${esc(a.description)}</p>` : ""}
      </div>`,
        )
        .join("")}
    </div>
  </section>`);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(p.fullName)} — Portfolio</title>
  <meta name="description" content="${esc(p.headline)}" />
  <style>${CSS}</style>
</head>
<body>
  <div class="pf-shell" data-theme="${esc(portfolio.theme)}">
    <div class="pf-document">
      <header class="pf-header">
        ${p.avatarUrl ? `<img class="pf-avatar" src="${esc(p.avatarUrl)}" alt="${esc(p.fullName)}" />` : ""}
        <div class="pf-headertext">
          <h1 class="pf-name">${esc(p.fullName)}</h1>
          <p class="pf-headline">${esc(p.headline)}</p>
          <div class="pf-contactrow">
            ${p.location ? `<span class="pf-contactitem">📍 ${esc(p.location)}</span>` : ""}
            ${p.email ? `<a class="pf-contactitem" href="mailto:${esc(p.email)}">✉ ${esc(p.email)}</a>` : ""}
            ${portfolio.socials.map((s) => `<a class="pf-contactitem" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`).join("")}
          </div>
        </div>
      </header>
      <div class="pf-body">
        ${sections.join("\n")}
        <footer class="pf-footer">Built with Portfolio Generator · <a href="#">Downloaded copy</a></footer>
      </div>
    </div>
  </div>
</body>
</html>`;
}
