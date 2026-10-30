/**
 * SQLite schema for the portfolio generator.
 *
 * One portfolio is an aggregate: a parent row in `portfolios` plus ordered
 * child rows in `socials`, `skills`, `projects` and `experiences`. Small
 * string lists (project tech tags, experience highlights) are stored as JSON
 * text because they are never queried on their own.
 *
 * Every statement is idempotent so it is safe to run on each cold start.
 */

export const SCHEMA_VERSION = 1;

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS portfolios (
  id             TEXT PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  edit_key_hash  TEXT NOT NULL,
  published      INTEGER NOT NULL DEFAULT 1,
  theme          TEXT NOT NULL DEFAULT 'minimal',
  full_name      TEXT NOT NULL,
  headline       TEXT NOT NULL,
  bio            TEXT NOT NULL,
  location       TEXT NOT NULL DEFAULT '',
  email          TEXT NOT NULL DEFAULT '',
  avatar_url     TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS socials (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id  TEXT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  url           TEXT NOT NULL,
  position      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS skills (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id  TEXT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  level         INTEGER NOT NULL DEFAULT 3,
  category      TEXT NOT NULL DEFAULT '',
  position      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id  TEXT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  tech_tags     TEXT NOT NULL DEFAULT '[]',
  repo_url      TEXT NOT NULL DEFAULT '',
  live_url      TEXT NOT NULL DEFAULT '',
  image_url     TEXT NOT NULL DEFAULT '',
  featured      INTEGER NOT NULL DEFAULT 0,
  position      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS experiences (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id  TEXT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  company       TEXT NOT NULL,
  role          TEXT NOT NULL,
  start_date    TEXT NOT NULL,
  end_date      TEXT NOT NULL DEFAULT '',
  is_current    INTEGER NOT NULL DEFAULT 0,
  location      TEXT NOT NULL DEFAULT '',
  highlights    TEXT NOT NULL DEFAULT '[]',
  position      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_socials_portfolio     ON socials(portfolio_id, position);
CREATE INDEX IF NOT EXISTS idx_skills_portfolio      ON skills(portfolio_id, position);
CREATE INDEX IF NOT EXISTS idx_projects_portfolio    ON projects(portfolio_id, position);
CREATE INDEX IF NOT EXISTS idx_experiences_portfolio ON experiences(portfolio_id, position);
`;
