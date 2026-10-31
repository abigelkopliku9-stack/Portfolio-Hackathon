import { portfolioInputSchema } from "./validation/portfolio.schema";

// Illustrative example used in the template gallery and optional demo portfolio.
export const demoPortfolio = portfolioInputSchema.parse({
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
      title: "Myfolio",
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
  events: [
    {
      title: "Hacktoberfest Kickoff Meetup",
      role: "Attendee",
      date: "2026-10",
      description: "Met 40+ developers and joined a team for the 24h sprint.",
      url: "",
    },
    {
      title: "Women in Tech Tirana",
      role: "Speaker",
      date: "2026-09",
      description: "Gave a 15-minute talk on building UIs with React.",
      url: "https://example.com/talk",
    },
  ],
  awards: [
    {
      title: "Best Beginner Project",
      issuer: "Campus Tech Society",
      date: "2026-05",
      result: "1st place",
      description: "Won with the Transit Heatmap project.",
    },
  ],
  theme: "minimal",
  published: true,
});

