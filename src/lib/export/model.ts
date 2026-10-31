import type { PortfolioRecord } from "@/lib/db";

/**
 * A simple, format-independent description of a portfolio document.
 * The PDF writer and the Word writer both read this same list of blocks,
 * so the two downloads always contain exactly the same content.
 */
export type LinkItem = { label: string; url: string };

export type Block =
  | { type: "title"; text: string }
  | { type: "subtitle"; text: string }
  | { type: "meta"; text: string }
  | { type: "links"; items: LinkItem[] }
  | { type: "heading"; text: string }
  | { type: "item"; left: string; right?: string }
  | { type: "sub"; text: string }
  | { type: "para"; text: string }
  | { type: "bullet"; text: string }
  | { type: "small"; text: string };

export type ExportDocument = {
  title: string;
  author: string;
  /** Hex colour without the leading #, used for headings. */
  accent: string;
  blocks: Block[];
};

// Dark enough to read on white paper, one per theme.
const ACCENTS: Record<string, string> = {
  minimal: "1F3A1F",
  dark: "222222",
  playful: "2D5A27",
  navy: "1E3A5F",
  gradient: "5B3FA0",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function month(value: string): string {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value.trim());
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : value;
}

const join = (parts: Array<string | undefined>, sep: string) => parts.filter((p): p is string => Boolean(p && p.trim())).join(sep);

export function buildExportDocument(portfolio: PortfolioRecord): ExportDocument {
  const p = portfolio.profile;
  const blocks: Block[] = [];

  blocks.push({ type: "title", text: p.fullName });
  if (p.headline) blocks.push({ type: "subtitle", text: p.headline });
  const meta = join([p.location, p.email], "  ·  ");
  if (meta) blocks.push({ type: "meta", text: meta });
  if (portfolio.socials.length) {
    blocks.push({ type: "links", items: portfolio.socials.map((s) => ({ label: s.label, url: s.url })) });
  }

  if (p.bio) {
    blocks.push({ type: "heading", text: "About" });
    blocks.push({ type: "para", text: p.bio });
  }

  if (portfolio.experience.length) {
    blocks.push({ type: "heading", text: "Work experience" });
    for (const e of portfolio.experience) {
      const end = e.current ? "Present" : month(e.endDate || "");
      blocks.push({ type: "item", left: e.role, right: join([month(e.startDate), end], " – ") });
      const sub = join([e.company, e.location], "  ·  ");
      if (sub) blocks.push({ type: "sub", text: sub });
      for (const h of e.highlights) blocks.push({ type: "bullet", text: h });
    }
  }

  if (portfolio.projects.length) {
    blocks.push({ type: "heading", text: "Projects" });
    for (const pr of portfolio.projects) {
      blocks.push({ type: "item", left: pr.featured ? `${pr.title} (featured)` : pr.title });
      if (pr.description) blocks.push({ type: "para", text: pr.description });
      if (pr.techTags.length) blocks.push({ type: "small", text: `Technologies: ${pr.techTags.join(", ")}` });
      const links: LinkItem[] = [];
      if (pr.repoUrl) links.push({ label: "Code", url: pr.repoUrl });
      if (pr.liveUrl) links.push({ label: "Live", url: pr.liveUrl });
      if (links.length) blocks.push({ type: "links", items: links });
    }
  }

  if (portfolio.skills.length) {
    blocks.push({ type: "heading", text: "Skills" });
    blocks.push({
      type: "para",
      text: portfolio.skills
        .map((s) => `${s.name} (${s.category ? `${s.category}, ` : ""}${s.level}/5)`)
        .join("  ·  "),
    });
  }

  if (portfolio.events.length) {
    blocks.push({ type: "heading", text: "Events" });
    for (const ev of portfolio.events) {
      blocks.push({ type: "item", left: ev.title, right: ev.date || undefined });
      if (ev.role) blocks.push({ type: "sub", text: ev.role });
      if (ev.description) blocks.push({ type: "para", text: ev.description });
      if (ev.url) blocks.push({ type: "links", items: [{ label: "Link", url: ev.url }] });
    }
  }

  if (portfolio.awards.length) {
    blocks.push({ type: "heading", text: "Awards" });
    for (const a of portfolio.awards) {
      blocks.push({ type: "item", left: a.title, right: a.date || undefined });
      const sub = join([a.issuer, a.result], "  ·  ");
      if (sub) blocks.push({ type: "sub", text: sub });
      if (a.description) blocks.push({ type: "para", text: a.description });
    }
  }

  return {
    title: `${p.fullName} — Portfolio`,
    author: p.fullName,
    accent: ACCENTS[portfolio.theme] ?? ACCENTS.minimal,
    blocks,
  };
}
