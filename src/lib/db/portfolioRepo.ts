import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

import { generateEditKey, hashEditKey } from "../auth/editKey";
import { buildSlug, isReservedSlug } from "../slug";
import type {
  Experience,
  PortfolioInput,
  Project,
  Skill,
  SocialLink,
  Theme,
} from "../validation/portfolio.schema";
import { getDb, transaction } from "./client";

/**
 * Data access layer for portfolios. This is the ONLY module that knows SQL.
 * Piece 2 (API routes) and Piece 4 (renderer) call these functions and never
 * touch `db.prepare(...)` directly.
 */

export type PortfolioRecord = PortfolioInput & {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePortfolioResult = {
  portfolio: PortfolioRecord;
  /** Returned exactly once, at creation time. Never stored in plain text. */
  editKey: string;
};

type PortfolioRow = {
  id: string;
  slug: string;
  published: number;
  theme: string;
  full_name: string;
  headline: string;
  bio: string;
  location: string;
  email: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
};

type SocialRow = { label: string; url: string };
type SkillRow = { name: string; level: number; category: string };
type ProjectRow = {
  title: string;
  description: string;
  tech_tags: string;
  repo_url: string;
  live_url: string;
  image_url: string;
  featured: number;
};
type ExperienceRow = {
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  is_current: number;
  location: string;
  highlights: string;
};

function parseStringArray(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function rowToRecord(
  row: PortfolioRow,
  children: {
    socials: SocialLink[];
    skills: Skill[];
    projects: Project[];
    experience: Experience[];
  },
): PortfolioRecord {
  return {
    id: row.id,
    slug: row.slug,
    theme: row.theme as Theme,
    published: row.published === 1,
    profile: {
      fullName: row.full_name,
      headline: row.headline,
      bio: row.bio,
      location: row.location,
      email: row.email,
      avatarUrl: row.avatar_url,
    },
    socials: children.socials,
    skills: children.skills,
    projects: children.projects,
    experience: children.experience,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function loadChildren(db: DatabaseSync, portfolioId: string) {
  const socials = db
    .prepare("SELECT label, url FROM socials WHERE portfolio_id = ? ORDER BY position")
    .all(portfolioId) as unknown as SocialRow[];

  const skills = db
    .prepare("SELECT name, level, category FROM skills WHERE portfolio_id = ? ORDER BY position")
    .all(portfolioId) as unknown as SkillRow[];

  const projects = db
    .prepare(
      `SELECT title, description, tech_tags, repo_url, live_url, image_url, featured
       FROM projects WHERE portfolio_id = ? ORDER BY position`,
    )
    .all(portfolioId) as unknown as ProjectRow[];

  const experience = db
    .prepare(
      `SELECT company, role, start_date, end_date, is_current, location, highlights
       FROM experiences WHERE portfolio_id = ? ORDER BY position`,
    )
    .all(portfolioId) as unknown as ExperienceRow[];

  return {
    socials: socials.map((s) => ({ label: s.label, url: s.url })),
    skills: skills.map((s) => ({ name: s.name, level: s.level, category: s.category })),
    projects: projects.map((p) => ({
      title: p.title,
      description: p.description,
      techTags: parseStringArray(p.tech_tags),
      repoUrl: p.repo_url,
      liveUrl: p.live_url,
      imageUrl: p.image_url,
      featured: p.featured === 1,
    })),
    experience: experience.map((e) => ({
      company: e.company,
      role: e.role,
      startDate: e.start_date,
      endDate: e.end_date,
      current: e.is_current === 1,
      location: e.location,
      highlights: parseStringArray(e.highlights),
    })),
  };
}

function insertChildren(db: DatabaseSync, portfolioId: string, input: PortfolioInput): void {
  const social = db.prepare(
    "INSERT INTO socials (portfolio_id, label, url, position) VALUES (?, ?, ?, ?)",
  );
  input.socials.forEach((item, index) => social.run(portfolioId, item.label, item.url, index));

  const skill = db.prepare(
    "INSERT INTO skills (portfolio_id, name, level, category, position) VALUES (?, ?, ?, ?, ?)",
  );
  input.skills.forEach((item, index) =>
    skill.run(portfolioId, item.name, item.level, item.category, index),
  );

  const project = db.prepare(
    `INSERT INTO projects
       (portfolio_id, title, description, tech_tags, repo_url, live_url, image_url, featured, position)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  input.projects.forEach((item, index) =>
    project.run(
      portfolioId,
      item.title,
      item.description,
      JSON.stringify(item.techTags),
      item.repoUrl,
      item.liveUrl,
      item.imageUrl,
      item.featured ? 1 : 0,
      index,
    ),
  );

  const experience = db.prepare(
    `INSERT INTO experiences
       (portfolio_id, company, role, start_date, end_date, is_current, location, highlights, position)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  input.experience.forEach((item, index) =>
    experience.run(
      portfolioId,
      item.company,
      item.role,
      item.startDate,
      item.current ? "" : item.endDate,
      item.current ? 1 : 0,
      item.location,
      JSON.stringify(item.highlights),
      index,
    ),
  );
}

function deleteChildren(db: DatabaseSync, portfolioId: string): void {
  for (const table of ["socials", "skills", "projects", "experiences"]) {
    db.prepare(`DELETE FROM ${table} WHERE portfolio_id = ?`).run(portfolioId);
  }
}

function selectBySlug(db: DatabaseSync, slug: string): PortfolioRow | undefined {
  return db
    .prepare("SELECT * FROM portfolios WHERE slug = ?")
    .get(slug) as unknown as PortfolioRow | undefined;
}

export function slugExists(slug: string): boolean {
  return selectBySlug(getDb(), slug) !== undefined;
}

/**
 * Inserts a new portfolio. The slug is derived from the name plus a random
 * suffix; on the astronomically unlikely collision we regenerate it.
 */
export function createPortfolio(
  input: PortfolioInput,
  options: { slug?: string; editKey?: string } = {},
): CreatePortfolioResult {
  return transaction((db) => {
    const editKey = options.editKey ?? generateEditKey();
    const editKeyHash = hashEditKey(editKey);
    const id = randomUUID();
    const now = new Date().toISOString();

    let lastError: unknown;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const slug = options.slug ?? buildSlug(input.profile.fullName);
      if (!options.slug && isReservedSlug(slug)) continue;
      try {
        db.prepare(
          `INSERT INTO portfolios
             (id, slug, edit_key_hash, published, theme, full_name, headline, bio,
              location, email, avatar_url, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).run(
          id,
          slug,
          editKeyHash,
          input.published ? 1 : 0,
          input.theme,
          input.profile.fullName,
          input.profile.headline,
          input.profile.bio,
          input.profile.location,
          input.profile.email,
          input.profile.avatarUrl,
          now,
          now,
        );
        insertChildren(db, id, input);
        const row = selectBySlug(db, slug);
        if (!row) throw new Error("Inserted portfolio could not be read back");
        return {
          portfolio: rowToRecord(row, loadChildren(db, id)),
          editKey,
        };
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : "";
        if (!message.includes("UNIQUE constraint failed: portfolios.slug")) throw error;
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error("Could not allocate a unique portfolio slug");
  });
}

export function getPortfolioBySlug(
  slug: string,
  options: { includeUnpublished?: boolean } = {},
): PortfolioRecord | null {
  const db = getDb();
  const row = selectBySlug(db, slug);
  if (!row) return null;
  if (!options.includeUnpublished && row.published !== 1) return null;
  return rowToRecord(row, loadChildren(db, row.id));
}

export function getPortfolioById(id: string): PortfolioRecord | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM portfolios WHERE id = ?")
    .get(id) as unknown as PortfolioRow | undefined;
  if (!row) return null;
  return rowToRecord(row, loadChildren(db, row.id));
}

/** Hash required by the edit-key check. Kept separate from PortfolioRecord so
 *  it can never leak into a public API response by accident. */
export function getEditKeyHash(slug: string): string | null {
  const row = getDb()
    .prepare("SELECT edit_key_hash FROM portfolios WHERE slug = ?")
    .get(slug) as unknown as { edit_key_hash: string } | undefined;
  return row?.edit_key_hash ?? null;
}

/** Full replace: the form always submits the complete portfolio. */
export function updatePortfolio(slug: string, input: PortfolioInput): PortfolioRecord | null {
  return transaction((db) => {
    const existing = selectBySlug(db, slug);
    if (!existing) return null;

    db.prepare(
      `UPDATE portfolios SET
         published = ?, theme = ?, full_name = ?, headline = ?, bio = ?,
         location = ?, email = ?, avatar_url = ?, updated_at = ?
       WHERE id = ?`,
    ).run(
      input.published ? 1 : 0,
      input.theme,
      input.profile.fullName,
      input.profile.headline,
      input.profile.bio,
      input.profile.location,
      input.profile.email,
      input.profile.avatarUrl,
      new Date().toISOString(),
      existing.id,
    );

    deleteChildren(db, existing.id);
    insertChildren(db, existing.id, input);

    const row = selectBySlug(db, slug);
    return row ? rowToRecord(row, loadChildren(db, row.id)) : null;
  });
}

export function deletePortfolio(slug: string): boolean {
  return transaction((db) => {
    const result = db.prepare("DELETE FROM portfolios WHERE slug = ?").run(slug);
    return Number(result.changes) > 0;
  });
}

export function countPortfolios(): number {
  const row = getDb().prepare("SELECT COUNT(*) AS total FROM portfolios").get() as unknown as {
    total: number;
  };
  return row.total;
}
