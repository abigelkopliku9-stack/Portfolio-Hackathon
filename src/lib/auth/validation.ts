import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address.").max(254, "Email is too long."));

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(80, "Name is too long."),
  email,
  password: z.string().min(8, "Password must be at least 8 characters.").max(128, "Password is too long."),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(128, "Password is too long."),
});

/** First human-readable validation message from a Zod error. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}
