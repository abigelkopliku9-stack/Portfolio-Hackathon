import type { PortfolioInput } from "@/lib/validation/portfolio.schema";
import Icon from "@/components/ui/Icon";

export function ProjectArt({ index = 0 }: { index?: number }) {
  return <div className={`project-art art-${index % 3}`} aria-hidden="true">
    {index % 3 === 0 ? <div className="art-window"><div className="art-window-bar"><i /><i /><i /></div><div className="art-window-body"><div className="art-sidebar"><i /><i /><i /><i /></div><div className="art-content"><span>Overview <b>↗</b></span><div className="art-stats"><i /><i /><i /></div><svg viewBox="0 0 220 75"><path d="M0 66 25 51 48 57 72 34 96 42 120 22 145 29 170 10 195 18 220 1" /></svg></div></div></div> : index % 3 === 1 ? <div className="art-orbits"><i /><i /><i /><span>Make<br />good things.</span><b>↗</b></div> : <div className="art-type">Less,<br /><em>but better.</em><span>DESIGNED WITH INTENTION / 001</span></div>}
  </div>;
}
export default function PortfolioPreview({ portfolio, browser = false, compact = false }: { portfolio: PortfolioInput; browser?: boolean; compact?: boolean }) {
  const { profile: p, theme, skills, projects } = portfolio;
  const initials = p.fullName.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join("") || "YN";
  return <div className={`portfolio-preview ${compact ? "preview-compact" : ""}`} data-theme={theme}>
    {browser && <div className="browser-bar"><span className="browser-dots"><i /><i /><i /></span><span><Icon name="lock" size={10} /> your own little corner of the internet</span><Icon name="external" size={12} /></div>}
    <div className="preview-page">
      <div className="preview-nav"><strong>{initials}<span>.</span></strong><span>Work &nbsp;&nbsp; About &nbsp;&nbsp; Contact <span>↗</span></span></div>
      <div className="preview-intro"><span className="preview-eyebrow"><i /> A LITTLE INTRODUCTION</span><h3>Hi, I’m {p.fullName.split(" ")[0] || "your name"}<span>.</span></h3><p className="preview-headline">{p.headline || "Your next chapter starts here."}</p><p className="preview-bio">{p.bio || "A little about you, the things you care about, and the work you love to do."}</p><span className="preview-contact">{p.location || "Based somewhere lovely"}<Icon name="arrow" size={13} /></span></div>
      <div className="preview-section-title"><span>SELECTED WORK</span><span>{String(projects.length).padStart(2, "0")}</span></div>
      <div className="preview-projects">{(projects.length ? projects.slice(0, 2) : [{ title: "Your next great project", techTags: [] }, { title: "Something worth sharing", techTags: [] }]).map((p, i) => <div className="preview-project" key={i}><ProjectArt index={i} /><div><strong>{p.title || "Untitled project"}</strong><Icon name="external" size={12} /></div><p>{p.techTags.join(" · ") || "A space for what you make"}</p></div>)}</div>
      {!compact && skills.length > 0 && <div className="preview-skills">{skills.slice(0, 5).map((s, i) => <span key={i}>{s.name}</span>)}</div>}
      <div className="preview-bottom"><span>Made with care. Made by {p.fullName.split(" ")[0] || "you"}.</span><Icon name="spark" size={14} /></div>
    </div>
  </div>;
}
