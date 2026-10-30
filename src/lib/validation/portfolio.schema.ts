import { z } from "zod";

/**
 * Single source of truth for the portfolio data contract.
 *
 * Everything derives from this file: the create form, the API validation,
 * and the TypeScript types used by the renderer. If you change a field here,
 * you must also add the matching column in `src/lib/db/schema.ts` and the
 * mapping in `src/lib/db/portfolioRepo.ts`.
 */

export const LIMITS = {
  socialsMax: 6,
  skillsMax: 30,
  projectsMax: 12,
  experienceMax: 10,
  techTagsMax: 10,
  highlightsMax: 5,
  bioMax: 1200,
  eventsMax: 15,
  awardsMax: 15,
} as const;

export const THEMES = ["minimal", "dark", "playful"] as const;
export type Theme = (typeof THEMES)[number];

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const text = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) => text(max).optional().default("");
const requiredText = (max: number) => text(max).min(1, "Required");
const month = () =>
  z
    .string()
    .trim()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use the YYYY-MM format");

/** Empty string is allowed (field not filled in); anything else must be http(s). */
const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .default("")
  .refine((value) => value === "" || isHttpUrl(value), {
    message: "Enter a full http(s) URL",
  });

const optionalEmail = z
  .string()
  .trim()
  .max(254)
  .optional()
  .default("")
  .refine(
    (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    { message: "Enter a valid email address" },
  );

export const socialSchema = z.object({
  label: requiredText(30),
  url: z
    .string()
    .trim()
    .max(2048)
    .refine(isHttpUrl, { message: "Enter a full http(s) URL" }),
});

export const skillSchema = z.object({
  name: requiredText(40),
  level: z.coerce.number().int().min(1).max(5).default(3),
  category: optionalText(30),
});

export const projectSchema = z.object({
  title: requiredText(80),
  description: requiredText(600),
  techTags: z.array(requiredText(30)).max(LIMITS.techTagsMax).default([]),
  repoUrl: optionalUrl,
  liveUrl: optionalUrl,
  imageUrl: optionalUrl,
  featured: z.boolean().default(false),
});

export const experienceSchema = z.object({
  company: requiredText(80),
  role: requiredText(80),
  startDate: month(),
  endDate: month().or(z.literal("")).default(""),
  current: z.boolean().default(false),
  location: optionalText(80),
  highlights: z.array(requiredText(200)).max(LIMITS.highlightsMax).default([]),
});

export const eventSchema = z.object({
  title: requiredText(120),
  role: optionalText(60),
  date: optionalText(40),
  description: optionalText(400),
  url: optionalUrl,
});

export const awardSchema = z.object({
  title: requiredText(120),
  issuer: optionalText(80),
  date: optionalText(40),
  result: optionalText(60),
  description: optionalText(400),
});

export const profileSchema = z.object({
  fullName: requiredText(80),
  headline: requiredText(120),
  bio: requiredText(LIMITS.bioMax),
  location: optionalText(80),
  email: optionalEmail,
  avatarUrl: optionalUrl,
});

export const portfolioInputSchema = z.object({
  profile: profileSchema,
  socials: z.array(socialSchema).max(LIMITS.socialsMax).default([]),
  skills: z.array(skillSchema).max(LIMITS.skillsMax).default([]),
  projects: z.array(projectSchema).max(LIMITS.projectsMax).default([]),
  experience: z.array(experienceSchema).max(LIMITS.experienceMax).default([]),
  events: z.array(eventSchema).max(LIMITS.eventsMax).default([]),
  awards: z.array(awardSchema).max(LIMITS.awardsMax).default([]),
  theme: z.enum(THEMES).default("minimal"),
  published: z.boolean().default(true),
});

export type PortfolioInput = z.infer<typeof portfolioInputSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type SocialLink = z.infer<typeof socialSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type EventItem = z.infer<typeof eventSchema>;
export type Award = z.infer<typeof awardSchema>;

/** Starting state for a brand new portfolio in the form. */
export const emptyPortfolio: PortfolioInput = {
  profile: {
    fullName: "",
    headline: "",
    bio: "",
    location: "",
    email: "",
    avatarUrl: "",
  },
  socials: [],
  skills: [],
  projects: [],
  experience: [],
  events: [],
  awards: [],
  theme: "minimal",
  published: true,
};

/** Human-readable summary of the first validation error, for toast messages. */
export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid data";
  const path = issue.path.join(".");
  return path ? `${path}: ${issue.message}` : issue.message;
}
