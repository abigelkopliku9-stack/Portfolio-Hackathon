# Portfolio Generator

A Next.js (App Router) app that turns a form into a live, hosted portfolio page.
Built for a 24-hour hackathon (Idea #8).

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- Node.js 26 (local install, no sudo) — `~/.local/opt/node`
- SQLite via Node's built-in `node:sqlite` (zero native deps) — file at `data/portfolio.db`
- Zod for validation (single source of truth)
- react-hook-form for the create/edit form

## Quick start

```bash
export PATH="$HOME/.local/opt/node/bin:$PATH"
npm install
cp .env.example .env.local   # optional; defaults to data/portfolio.db
npm run db:seed              # creates the demo portfolio
npm run dev                  # http://localhost:3000
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run db:seed` | Seed `demo-portfolio` (idempotent) |
| `npm run lint` | ESLint |

## Project layout

```
src/
├─ app/
│  ├─ page.tsx                      # landing
│  ├─ create/page.tsx               # create wizard
│  ├─ dashboard/[slug]/page.tsx     # unlock + edit
│  ├─ p/[slug]/page.tsx             # public portfolio
│  └─ api/
│     ├─ health/route.ts
│     └─ portfolios/
│        ├─ route.ts                # POST create
│        └─ [slug]/
│           ├─ route.ts             # GET / PUT / DELETE
│           ├─ verify/route.ts      # edit-key check
│           └─ export/route.ts      # download as HTML
├─ components/
│  ├─ ui/FormControls.tsx
│  ├─ form/                         # wizard steps, RepeatableCard, TagInput
│  └─ portfolio/                    # PortfolioView + CSS module (themes)
├─ hooks/useDraft.ts                # localStorage autosave
├─ lib/
│  ├─ db/                           # client, schema, repo, seed
│  ├─ validation/portfolio.schema.ts # Zod = single source of truth
│  ├─ api.ts, rateLimit.ts, slug.ts, auth/editKey.ts, exportHtml.ts
└─ types/portfolio.ts
```

## Data model (schema-driven)

One portfolio is an aggregate: a `portfolios` row plus ordered child rows
(`socials`, `skills`, `projects`, `experiences`, `events`, `awards`).
The Zod schema in `src/lib/validation/portfolio.schema.ts` drives the form,
the API validation, and the TypeScript types. Child arrays are stored as
JSON only where they are never queried on their own (tech tags, highlights).

## Edit protection

Each portfolio gets a 24-char secret `editKey` at creation (shown once).
Only its SHA-256 hash is stored. The dashboard unlocks with the key.

## Themes

`minimal`, `dark`, `playful` — selected in the form and applied via
`data-theme` on the portfolio shell (CSS variables).
