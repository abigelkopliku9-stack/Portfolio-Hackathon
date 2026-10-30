"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { emptyPortfolio, portfolioInputSchema } from "@/lib/validation/portfolio.schema";
import type { PortfolioInput } from "@/lib/validation/portfolio.schema";
import { useDraft, useDebouncedSave } from "@/hooks/useDraft";
import { Button, Card, Field, Input, Textarea } from "@/components/ui/FormControls";
import { useT } from "@/components/LocaleProvider";
import { RepeatableCard } from "@/components/form/RepeatableCard";
import { TagInput } from "@/components/form/TagInput";

// STEPS is built inside the component so labels come from i18n.

type FormValues = PortfolioInput;

type WizardProps = {
  mode?: "create" | "edit";
  initialValues?: PortfolioInput;
  slug?: string;
  editKey?: string;
};

export default function PortfolioWizard({
  mode = "create",
  initialValues,
  slug,
  editKey,
}: WizardProps) {
  const storageKey = mode === "edit" && slug ? `portfolio-draft-${slug}` : undefined;
  const { hasDraft, load, save, clear } = useDraft<FormValues>(storageKey);
  const t = useT();
  const STEPS = [
    t("wizard.step.profile"),
    t("wizard.step.skills"),
    t("wizard.step.projects"),
    t("wizard.step.experience"),
    t("wizard.step.events"),
    t("wizard.step.awards"),
    t("wizard.step.review"),
  ] as const;
  const router = useRouter();
  const [redirectIn, setRedirectIn] = useState<number | null>(null);
  const [draftBanner, setDraftBanner] = useState(hasDraft);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ slug: string; editKey: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(portfolioInputSchema) as any,
    defaultValues: initialValues ?? emptyPortfolio,
    mode: "onBlur",
  });

  const { register, control, handleSubmit, watch, setValue, getValues, formState } = form;

  // {t("create.draft.restore")} draft on mount if present (only once).
  const [restored, setRestored] = useState(false);
  if (hasDraft && !restored && typeof window !== "undefined") {
    // defer to effect-like: do it lazily
  }

  // field arrays
  const socials = useFieldArray({ control, name: "socials" });
  const skills = useFieldArray({ control, name: "skills" });
  const projects = useFieldArray({ control, name: "projects" });
  const experience = useFieldArray({ control, name: "experience" });
  const events = useFieldArray({ control, name: "events" });
  const awards = useFieldArray({ control, name: "awards" });

  const debouncedSave = useDebouncedSave<FormValues>(save);

  // Auto-redirect to the generated portfolio shortly after success.
  useEffect(() => {
    if (!result) {
      setRedirectIn(null);
      return;
    }
    setRedirectIn(5);
    const tick = setInterval(() => {
      setRedirectIn((n) => {
        if (n === null) return null;
        if (n <= 1) {
          clearInterval(tick);
          router.push(`/p/${result.slug}`);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [result, router]);

  // autosave on every change
  const values = watch();

  // Profile completeness score (personalization hint).
  const completeness = (() => {
    let score = 0;
    let total = 0;
    const p = values.profile ?? ({} as any);
    const checks: Array<[unknown, number]> = [
      [p.fullName, 10],
      [p.headline, 10],
      [p.bio, 10],
      [p.location, 5],
      [p.email, 5],
      [p.avatarUrl, 5],
      [(values.socials ?? []).length > 0, 5],
      [(values.skills ?? []).length > 0, 10],
      [(values.projects ?? []).length > 0, 15],
      [(values.experience ?? []).length > 0, 15],
      [(values.events ?? []).length > 0, 5],
      [(values.awards ?? []).length > 0, 5],
    ];
    for (const [val, w] of checks) {
      total += w;
      if (val && (typeof val !== "string" || val.trim().length > 0)) score += w;
    }
    return total > 0 ? (score / total) * 100 : 0;
  })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    debouncedSave(values);
  }, [JSON.stringify(values)]);

  // restore draft prompt handled by banner; apply on user choice
  function restoreDraft() {
    const d = load();
    if (d) form.reset(d);
    setDraftBanner(false);
  }
  function discardDraft() {
    clear();
    setDraftBanner(false);
  }

  async function onSubmit(data: FormValues) {
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "edit" && slug && editKey) {
        const res = await fetch(`/api/portfolios/${slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "x-edit-key": editKey },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setError(json.error ?? t("dashboard.unlock.error"));
          return;
        }
        clear();
        setResult({ slug, editKey });
      } else {
        const res = await fetch("/api/portfolios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setError(json.error ?? t("dashboard.unlock.error"));
          return;
        }
        clear();
        setResult({ slug: json.portfolio.slug, editKey: json.editKey });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("dashboard.unlock.error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const isEdit = mode === "edit";
    return (
      <Card className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold text-emerald-600">
          {isEdit ? t("wizard.success.updated") : t("wizard.success.title")}
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {isEdit ? t("wizard.success.updatedSubtitle") : t("wizard.success.subtitle")}
        </p>
        <code className="mt-3 block rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
          /p/{result.slug}
        </code>
        <Link
          href={`/p/${result.slug}`}
          className="mt-4 inline-block rounded-full bg-[#1f3a1f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2d5a27]"
        >
          View my portfolio
        </Link>
        {!isEdit && (
          <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-left text-sm dark:border-amber-700 dark:bg-amber-950">
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              {t("wizard.success.key.title")}
            </p>
            <code className="mt-2 block break-all rounded bg-white px-3 py-2 font-mono text-xs dark:bg-slate-900">
              {result.editKey}
            </code>
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
              {t("wizard.success.key.hint").replace("{slug}", result.slug)}
            </p>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/p/${result.slug}`}
            className="rounded-full bg-[#1f3a1f] px-5 py-2 text-sm font-semibold text-[#f5f0e6] hover:bg-[#2d5a27]"
          >
            {t("wizard.success.view")}
          </Link>
          {redirectIn !== null && redirectIn > 0 && (
            <Button variant="ghost" onClick={() => setRedirectIn(null)}>
              {t("wizard.success.stay").replace("{n}", String(redirectIn))}
            </Button>
          )}
        </div>
        <Button className="mt-4" variant="ghost" onClick={() => { setResult(null); form.reset(initialValues ?? emptyPortfolio); setStep(0); setRedirectIn(null); }}>
          {isEdit ? t("wizard.success.keepEditing") : t("wizard.success.createAnother")}
        </Button>
      </Card>
    );
  }

  const profileErrors = formState.errors.profile;

  return (
    <div className="mx-auto max-w-3xl">
      {draftBanner && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#1f3a1f]/30 bg-[#e6efe6] px-4 py-3 text-sm dark:border-[#1f3a1f] dark:bg-[#0f1f0f]">
          <span>{t("create.draft.banner")}</span>
          <div className="flex gap-2">
            <Button variant="primary" onClick={restoreDraft}>{t("create.draft.restore")}</Button>
            <Button variant="ghost" onClick={discardDraft}>{t("create.draft.discard")}</Button>
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              i === step
                ? "bg-[#1f3a1f] text-[#f5f0e6]"
                : i < step
                ? "bg-[#e6efe6] text-[#1f3a1f] dark:bg-[#1f3a1f] dark:text-[#f5f0e6]"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 0 && (
          <Card>
            <h2 className="mb-4 text-xl font-bold">{t("wizard.profile.heading")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("wizard.profile.fullName")} error={profileErrors?.fullName?.message}>
                <Input {...register("profile.fullName")} placeholder="Ada Lovelace" />
              </Field>
              <Field label={t("wizard.profile.headline")} error={profileErrors?.headline?.message} hint="One line about you.">
                <Input {...register("profile.headline")} placeholder="Frontend developer" />
              </Field>
            </div>
            <div className="mt-4">
              <Field label={t("wizard.profile.bio")} error={profileErrors?.bio?.message}>
                <Textarea {...register("profile.bio")} rows={4} placeholder="Tell your story..." />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t("wizard.profile.location")}>
                <Input {...register("profile.location")} placeholder="Tirana, Albania" />
              </Field>
              <Field label={t("wizard.profile.email")}>
                <Input {...register("profile.email")} placeholder="you@example.com" />
              </Field>
            </div>
            <div className="mt-4">
              <Field label={t("wizard.profile.avatarUrl")} hint="Link to a profile picture.">
                <Input {...register("profile.avatarUrl")} placeholder="https://..." />
              </Field>
            </div>

            <h3 className="mb-2 mt-6 text-sm font-semibold text-slate-700 dark:text-slate-200">Social links</h3>
            <div className="space-y-3">
              {socials.fields.map((f, i) => (
                <div key={f.id} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
                  <Input {...register(`socials.${i}.label` as const)} placeholder="GitHub" />
                  <Input {...register(`socials.${i}.url` as const)} placeholder="https://github.com/you" />
                  <Button type="button" variant="danger" onClick={() => socials.remove(i)}>Remove</Button>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => socials.append({ label: "", url: "" })}>
                + Add social link
              </Button>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <h2 className="mb-4 text-xl font-bold">{t("wizard.skills.heading")}</h2>
            <div className="space-y-3">
              {skills.fields.map((f, i) => (
                <div key={f.id} className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
                  <Input {...register(`skills.${i}.name` as const)} placeholder="TypeScript" />
                  <Input type="number" min={1} max={5} {...register(`skills.${i}.level` as const, { valueAsNumber: true })} placeholder="Level 1-5" />
                  <Input {...register(`skills.${i}.category` as const)} placeholder="Languages" />
                  <Button type="button" variant="danger" onClick={() => skills.remove(i)}>Remove</Button>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => skills.append({ name: "", level: 3, category: "" })}>
                + Add skill
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <h2 className="mb-4 text-xl font-bold">{t("wizard.projects.heading")}</h2>
            <div className="space-y-4">
              {projects.fields.map((f, i) => (
                <RepeatableCard key={f.id} title="Project" index={i} onRemove={() => projects.remove(i)}>
                  <Field label="Title">
                    <Input {...register(`projects.${i}.title` as const)} />
                  </Field>
                  <Field label="Description">
                    <Textarea {...register(`projects.${i}.description` as const)} rows={3} />
                  </Field>
                  <Field label="Tech tags">
                    <TagInput
                      value={watch(`projects.${i}.techTags`) ?? []}
                      onChange={(next) => setValue(`projects.${i}.techTags`, next)}
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Repo URL">
                      <Input {...register(`projects.${i}.repoUrl` as const)} placeholder="https://github.com/..." />
                    </Field>
                    <Field label="Live URL">
                      <Input {...register(`projects.${i}.liveUrl` as const)} placeholder="https://..." />
                    </Field>
                  </div>
                  <Field label="Image URL">
                    <Input {...register(`projects.${i}.imageUrl` as const)} placeholder="https://..." />
                  </Field>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" {...register(`projects.${i}.featured` as const)} />
                    Featured project
                  </label>
                </RepeatableCard>
              ))}
              <Button type="button" variant="secondary" onClick={() => projects.append({ title: "", description: "", techTags: [], repoUrl: "", liveUrl: "", imageUrl: "", featured: false })}>
                + Add project
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <h2 className="mb-4 text-xl font-bold">{t("wizard.experience.heading")}</h2>
            <div className="space-y-4">
              {experience.fields.map((f, i) => (
                <RepeatableCard key={f.id} title="Job" index={i} onRemove={() => experience.remove(i)}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Company">
                      <Input {...register(`experience.${i}.company` as const)} />
                    </Field>
                    <Field label="Role">
                      <Input {...register(`experience.${i}.role` as const)} />
                    </Field>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Start (YYYY-MM)">
                      <Input {...register(`experience.${i}.startDate` as const)} placeholder="2024-06" />
                    </Field>
                    <Field label="End (YYYY-MM)" hint="Leave empty if current.">
                      <Input {...register(`experience.${i}.endDate` as const)} placeholder="2025-01" />
                    </Field>
                  </div>
                  <Field label={t("wizard.profile.location")}>
                    <Input {...register(`experience.${i}.location` as const)} />
                  </Field>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" {...register(`experience.${i}.current` as const)} />
                    I currently work here
                  </label>
                  <Field label="Highlights (one per line)">
                    <Textarea
                      rows={3}
                      defaultValue={(watch(`experience.${i}.highlights`) ?? []).join("\n")}
                      onBlur={(e) =>
                        setValue(
                          `experience.${i}.highlights`,
                          e.target.value.split("\n").map((x) => x.trim()).filter(Boolean),
                        )
                      }
                    />
                  </Field>
                </RepeatableCard>
              ))}
              <Button type="button" variant="secondary" onClick={() => experience.append({ company: "", role: "", startDate: "", endDate: "", current: false, location: "", highlights: [] })}>
                + Add job
              </Button>
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <h2 className="mb-4 text-xl font-bold">{t("wizard.events.heading")}</h2>
            <p className="mb-4 text-sm text-slate-500">Meetups, conferences, hackathons you attended or spoke at.</p>
            <div className="space-y-4">
              {events.fields.map((f, i) => (
                <RepeatableCard key={f.id} title="Event" index={i} onRemove={() => events.remove(i)}>
                  <Field label="Event name">
                    <Input {...register(`events.${i}.title` as const)} />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Your role">
                      <Input {...register(`events.${i}.role` as const)} placeholder="Attendee / Speaker" />
                    </Field>
                    <Field label="Date">
                      <Input {...register(`events.${i}.date` as const)} placeholder="2026-10" />
                    </Field>
                  </div>
                  <Field label="Description">
                    <Textarea {...register(`events.${i}.description` as const)} rows={2} />
                  </Field>
                  <Field label="Link">
                    <Input {...register(`events.${i}.url` as const)} placeholder="https://..." />
                  </Field>
                </RepeatableCard>
              ))}
              <Button type="button" variant="secondary" onClick={() => events.append({ title: "", role: "", date: "", description: "", url: "" })}>
                + Add event
              </Button>
            </div>
          </Card>
        )}

        {step === 5 && (
          <Card>
            <h2 className="mb-4 text-xl font-bold">{t("wizard.awards.heading")}</h2>
            <div className="space-y-4">
              {awards.fields.map((f, i) => (
                <RepeatableCard key={f.id} title="Award" index={i} onRemove={() => awards.remove(i)}>
                  <Field label="Title">
                    <Input {...register(`awards.${i}.title` as const)} />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Issuer / Organizer">
                      <Input {...register(`awards.${i}.issuer` as const)} />
                    </Field>
                    <Field label="Date">
                      <Input {...register(`awards.${i}.date` as const)} placeholder="2026-05" />
                    </Field>
                  </div>
                  <Field label="Result">
                    <Input {...register(`awards.${i}.result` as const)} placeholder="1st place" />
                  </Field>
                  <Field label="Description">
                    <Textarea {...register(`awards.${i}.description` as const)} rows={2} />
                  </Field>
                </RepeatableCard>
              ))}
              <Button type="button" variant="secondary" onClick={() => awards.append({ title: "", issuer: "", date: "", result: "", description: "" })}>
                + Add award
              </Button>
            </div>
          </Card>
        )}

        {step === 6 && (
          <Card>
            <h2 className="mb-4 text-xl font-bold">{t("wizard.review.heading")}</h2>
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-xs text-[#5a5a5a]">
                <span>Profile completeness</span>
                <span>{Math.round(completeness)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e6efe6]">
                <div
                  className="h-full rounded-full bg-[#1f3a1f] transition-all"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Check everything looks right, then submit. You can jump back to any step using the pills above.
            </p>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">{t("wizard.review.name")}:</span> {watch("profile.fullName") || "—"}</div>
              <div><span className="font-semibold">{t("wizard.review.headline")}:</span> {watch("profile.headline") || "—"}</div>
              <div><span className="font-semibold">{t("wizard.review.skills")}:</span> {watch("skills")?.length ?? 0}</div>
              <div><span className="font-semibold">{t("wizard.review.projects")}:</span> {watch("projects")?.length ?? 0}</div>
              <div><span className="font-semibold">{t("wizard.review.experience")}:</span> {watch("experience")?.length ?? 0}</div>
              <div><span className="font-semibold">{t("wizard.review.events")}:</span> {watch("events")?.length ?? 0}</div>
              <div><span className="font-semibold">{t("wizard.review.awards")}:</span> {watch("awards")?.length ?? 0}</div>
              <div><span className="font-semibold">{t("wizard.review.theme")}:</span> {watch("theme")}</div>
            </div>
            <div className="mt-4">
              <Field label="Theme">
                <select
                  {...register("theme")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="minimal">Minimal</option>
                  <option value="dark">Dark</option>
                  <option value="playful">Playful</option>
                </select>
              </Field>
            </div>
            {error && (
              <div className="mt-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-200">
                {error}
              </div>
            )}
          </Card>
        )}

        <div className="flex items-center justify-between">
          <Button type="button" variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            {t("wizard.review.back")}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
              {t("wizard.review.next")}
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting ? t("wizard.review.submitting") : t("wizard.review.submit")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

