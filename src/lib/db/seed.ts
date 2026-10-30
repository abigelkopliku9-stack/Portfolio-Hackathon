/**
 * Seeds one complete demo portfolio so the team can develop the renderer and
 * API without filling out the form every time.
 *
 *   npm run db:seed
 *
 * Safe to re-run: it deletes and recreates only `demo-portfolio`.
 */

import { closeDb, createPortfolio, databasePath, deletePortfolio } from "./index";
import { portfolioInputSchema } from "../validation/portfolio.schema";

const DEMO_SLUG = "demo-portfolio";
const DEMO_EDIT_KEY = "demo-key-123";

const demo = portfolioInputSchema.parse({
  profile: {
    fullName: "Ada Lovelace",
    headline: "Frontend developer & data-visualization nerd",
    bio: "I build small, fast interfaces that make complicated data feel obvious. Currently studying computer science and shipping side projects every weekend.",
    location: "Tirana, Albania",
    email: "ada@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=47",
  },
  socials: [
    { label: "GitHub", url: "https://github.com/ada" },
    { label: "LinkedIn", url: "https://linkedin.com/in/ada" },
  ],
  skills: [
    { name: "TypeScript", level: 4, category: "Languages" },
    { name: "React", level: 5, category: "Frontend" },
    { name: "Next.js", level: 4, category: "Frontend" },
    { name: "SQL", level: 3, category: "Data" },
    { name: "Figma", level: 3, category: "Design" },
  ],
  projects: [
    {
      title: "Portfolio Generator",
      description:
        "A form-to-website tool that turns a profile into a hosted portfolio page. Built in 24 hours with three teammates.",
      techTags: ["Next.js", "SQLite", "Tailwind"],
      repoUrl: "https://github.com/ada/portfolio-generator",
      liveUrl: "",
      imageUrl: "",
      featured: true,
    },
    {
      title: "Transit Heatmap",
      description:
        "Visualizes one year of bus delays on an interactive map. Handles 2M rows without a charting library.",
      techTags: ["D3", "TypeScript"],
      repoUrl: "https://github.com/ada/transit-heatmap",
      liveUrl: "https://transit.example.com",
      imageUrl: "",
      featured: false,
    },
  ],
  experience: [
    {
      company: "Kosovo Innovation Lab",
      role: "Frontend Intern",
      startDate: "2026-06",
      endDate: "",
      current: true,
      location: "Remote",
      highlights: ["Rebuilt the dashboard in React, cutting load time by 40%."],
    },
    {
      company: "Campus Tech Society",
      role: "Workshop Lead",
      startDate: "2024-10",
      endDate: "2025-09",
      current: false,
      location: "Tirana",
      highlights: ["Ran 12 beginner JavaScript workshops for 200+ students."],
    },
  ],
  theme: "dark",
  published: true,
});

deletePortfolio(DEMO_SLUG);
const { portfolio, editKey } = createPortfolio(demo, {
  slug: DEMO_SLUG,
  editKey: DEMO_EDIT_KEY,
});

console.log("Seeded demo portfolio");
console.log("  database :", databasePath());
console.log("  public   : /p/" + portfolio.slug);
console.log("  admin    : /dashboard/" + portfolio.slug);
console.log("  edit key :", editKey);

closeDb();
