"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useFieldArray, useForm, type FieldPath } from "react-hook-form";
import { emptyPortfolio, portfolioInputSchema, LIMITS, THEMES, type PortfolioInput, type Theme } from "@/lib/validation/portfolio.schema";
import { useDraft, useDebouncedSave } from "@/hooks/useDraft";
import { Button, Card, Field, Input, Textarea } from "@/components/ui/FormControls";
import { useT } from "@/components/LocaleProvider";
import { RepeatableCard } from "./RepeatableCard";
import { TagInput } from "./TagInput";
import AvatarDropzone from "./AvatarDropzone";
import Icon, { type IconName } from "@/components/ui/Icon";
import PortfolioPreview from "@/components/preview/PortfolioPreview";
import { rememberPortfolio } from "@/lib/localPortfolios";

type WizardProps = { mode?: "create" | "edit"; initialValues?: PortfolioInput; slug?: string; editKey?: string; defaultTheme?: Theme };
const ROOTS = [["profile", "socials"], ["skills"], ["projects"], ["experience"], ["events"], ["awards"], []];
const STEP_KEYS = ["profile", "skills", "projects", "experience", "events", "awards", "review"];
const STEP_ICONS: IconName[] = ["edit", "spark", "folder", "layout", "globe", "spark", "check"];
export default function PortfolioWizard({ mode = "create", initialValues, slug, editKey, defaultTheme = "minimal" }: WizardProps) {
  const t = useT();
  const form = useForm<PortfolioInput>({ defaultValues: initialValues ?? { ...emptyPortfolio, theme: defaultTheme }, shouldUnregister: false });
  const { register, control, watch, setValue, getValues, formState: { errors }, clearErrors, setError: setFieldError } = form;
  const values = watch();
  const { hasDraft, load, save, clear } = useDraft<PortfolioInput>(mode === "edit" ? `portfolio-draft-${slug}` : undefined);
  const { schedule, cancel } = useDebouncedSave(save);
  const [draftResolved, setDraftResolved] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState<{ slug: string; editKey: string } | null>(null);
  const socials = useFieldArray({ control, name: "socials" });
  const skills = useFieldArray({ control, name: "skills" });
  const projects = useFieldArray({ control, name: "projects" });
  const experience = useFieldArray({ control, name: "experience" });
  const events = useFieldArray({ control, name: "events" });
  const awards = useFieldArray({ control, name: "awards" });

  // Subscribe to actual edits, never the initial blank render or an unresolved saved draft.
  useEffect(() => {
    const subscription = form.watch((data, info) => {
      if (!info.name || result || (hasDraft && !draftResolved)) return;
      setDraftResolved(true);
      schedule(data as PortfolioInput);
    });
    return () => subscription.unsubscribe();
  }, [form, hasDraft, draftResolved, result, schedule]);

  function errorAt(path: string): string | undefined {
    let current: unknown = errors;
    for (const key of path.split(".")) current = current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined;
    return current && typeof current === "object" && "message" in current ? String(current.message) : undefined;
  }
  function field(path: FieldPath<PortfolioInput>, label: string, options: { placeholder?: string; type?: string; hint?: string; area?: boolean; maxLength?: number; disabled?: boolean } = {}) {
    return <Field label={label} error={errorAt(path)} hint={options.hint}>{options.area ? <Textarea {...register(path)} rows={4} maxLength={options.maxLength} placeholder={options.placeholder} /> : <Input {...register(path, options.type === "number" ? { valueAsNumber: true } : undefined)} type={options.type || "text"} min={options.type === "number" ? 1 : undefined} max={options.type === "number" ? 5 : undefined} maxLength={options.maxLength} placeholder={options.placeholder} disabled={options.disabled} />}</Field>;
  }
  function restoreDraft() {
    cancel();
    const draft = load();
    if (draft && draft.profile && typeof draft.profile.fullName === "string" && typeof draft.profile.headline === "string" && typeof draft.profile.bio === "string" && [draft.socials, draft.skills, draft.projects, draft.experience, draft.events, draft.awards].every(a => Array.isArray(a) && a.every(item => item && typeof item === "object"))) {
      form.reset({ ...emptyPortfolio, ...draft, profile: { ...emptyPortfolio.profile, ...draft.profile } }); setError("");
    } else { clear(); setError(t("editor.invalidDraft")); }
    setDraftResolved(true);
  }
  function discardDraft() { cancel(); clear(); setDraftResolved(true); }
  function validate(index?: number) {
    clearErrors(); setError("");
    const parsed = portfolioInputSchema.safeParse(getValues());
    if (parsed.success) return parsed.data;
    const issues = index === undefined ? parsed.error.issues : parsed.error.issues.filter(i => ROOTS[index].includes(String(i.path[0])));
    if (!issues.length) return getValues();
    for (const issue of issues) setFieldError(issue.path.join(".") as FieldPath<PortfolioInput>, { type: "validate", message: issue.message });
    const first = issues[0];
    if (index === undefined) setStep(Math.max(0, ROOTS.findIndex(r => r.includes(String(first.path[0])))));
    setError(`${t("editor.checkFields")} ${first.path.join(" → ")}: ${first.message}`);
    return null;
  }
  function goTo(index: number) { if (index < step || validate(step)) { setStep(index); setError(""); } }
  async function publish() {
    const data = validate(); if (!data) return;
    setSubmitting(true); cancel();
    try {
      const editing = mode === "edit" && slug && editKey;
      const res = await fetch(editing ? `/api/portfolios/${slug}` : "/api/portfolios", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json", ...(editing ? { "x-edit-key": editKey } : {}) }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || t("editor.saveError"));
      clear();
      rememberPortfolio({ slug: json.portfolio.slug, fullName: data.profile.fullName, headline: data.profile.headline, theme: data.theme, updatedAt: json.portfolio.updatedAt });
      setResult({ slug: json.portfolio.slug, editKey: editing ? editKey : json.editKey });
    } catch (e) { setError(e instanceof Error ? e.message : t("editor.saveError")); save(data); } finally { setSubmitting(false); }
  }
  async function copy(text: string) { try { await navigator.clipboard.writeText(text); setNotice(t("editor.copied")); } catch { setNotice(t("editor.copyFallback")); } }
  function downloadAccess() {
    if (!result) return;
    const base = window.location.origin;
    const blob = new Blob([`Portfolio Generator — your access details\n\nPortfolio: ${base}/p/${result.slug}\nEditor: ${base}/dashboard/${result.slug}\nEdit key: ${result.editKey}\n\nKeep this file private. The edit key is required to change your portfolio.\n`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${result.slug}-access.txt`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const heading = <div className="page-heading"><div><span className="eyebrow"><Icon name="spark" size={13} />{t(mode === "edit" ? "editor.editEyebrow" : "editor.eyebrow")}</span><h1>{t(mode === "edit" ? "dashboard.title" : "create.title")}</h1><p>{t(mode === "edit" ? "dashboard.subtitle" : "create.subtitle")}</p></div><span className="saved-status"><Icon name="lock" size={13} />{t("editor.browserDraft")}</span></div>;
  if (result) return <>{heading}<Card className="success-card"><div className="success-icon"><Icon name="check" size={25} /></div><h2>{t(mode === "edit" ? "wizard.success.updated" : "wizard.success.title")}</h2><p>{t("wizard.success.subtitle")}</p><div className="success-link"><code>/p/{result.slug}</code><button className="icon-button" onClick={() => copy(`${window.location.origin}/p/${result.slug}`)} aria-label="Copy portfolio link"><Icon name="copy" size={17} /></button></div>{mode === "create" && <div className="edit-key-box"><h3><Icon name="lock" size={15} />{t("wizard.success.key.title")}</h3><code>{result.editKey}</code><p>{t("wizard.success.key.hint").replace("{slug}", result.slug)}</p><div className="success-actions"><Button variant="secondary" onClick={() => copy(result.editKey)}><Icon name="copy" size={13} />{t("editor.copyKey")}</Button><Button variant="secondary" onClick={downloadAccess}><Icon name="download" size={13} />{t("editor.downloadAccess")}</Button></div></div>}<div className="success-actions"><Link href={`/p/${result.slug}`} className="button">{t("wizard.success.view")}<Icon name="external" size={14} /></Link><Link href={`/dashboard/${result.slug}`} className="button button-secondary">{t("editor.openEditor")}<Icon name="edit" size={14} /></Link></div><p className="copy-status" role="status">{notice}</p><Button variant="ghost" onClick={() => { setResult(null); setStep(0); if (mode === "create") { form.reset({ ...emptyPortfolio, theme: defaultTheme }); setDraftResolved(true); } }}>{t(mode === "edit" ? "wizard.success.keepEditing" : "wizard.success.createAnother")}</Button></Card></>;

  const isEmpty = [false, !skills.fields.length, !projects.fields.length, !experience.fields.length, !events.fields.length, !awards.fields.length, false][step];
  return <>{heading}{hasDraft && !draftResolved && <div className="draft-banner" role="status"><span>{t("create.draft.banner")}</span><div><Button onClick={restoreDraft}>{t("create.draft.restore")}</Button><Button variant="ghost" onClick={discardDraft}>{t("create.draft.discard")}</Button></div></div>}
    <div className="wizard-layout"><aside className="wizard-sidebar"><p className="eyebrow">{t("editor.yourPortfolio")}</p><nav className="wizard-steps" aria-label="Portfolio steps">{STEP_KEYS.map((s, i) => <button key={s} type="button" onClick={() => goTo(i)} className={`wizard-step ${step === i ? "active" : ""} ${i < step ? "complete" : ""}`} aria-current={step === i ? "step" : undefined}><span>{i < step ? <Icon name="check" size={11} /> : i + 1}</span>{t(`wizard.step.${s}`)}</button>)}</nav><div className="sidebar-note"><Icon name="spark" size={19} /><strong>{t("editor.takeYourTime")}</strong>{t("editor.draftNote")}</div></aside>
      <div className="wizard-center"><form onSubmit={e => { e.preventDefault(); if (step === 6) void publish(); else goTo(step + 1); }} noValidate><div className="wizard-card"><p className="step-counter">{t("editor.step")} {String(step + 1).padStart(2, "0")} / 07</p><h2>{t(`wizard.${STEP_KEYS[step]}.heading`)}</h2><p className="step-description">{t(`editor.description.${STEP_KEYS[step]}`)}</p>
        {isEmpty && <div className="empty-section"><Icon name={STEP_ICONS[step]} size={25} /><h3>{t(`editor.empty.${STEP_KEYS[step]}`)}</h3><p>{t("editor.optionalSection")}</p></div>}
        {step === 0 && <div className="form-stack"><div className="field-grid">{field("profile.fullName", t("wizard.profile.fullName"), { placeholder: "Ada Lovelace", maxLength: 80 })}{field("profile.headline", t("wizard.profile.headline"), { placeholder: t("wizard.profile.headline.placeholder"), maxLength: 120 })}</div>{field("profile.bio", t("wizard.profile.bio"), { area: true, placeholder: t("wizard.profile.bio.placeholder"), maxLength: LIMITS.bioMax, hint: `${values.profile.bio.length} / ${LIMITS.bioMax}` })}<div className="field-grid">{field("profile.location", t("wizard.profile.location"), { placeholder: "Tirana, Albania", maxLength: 80 })}{field("profile.email", t("wizard.profile.email"), { placeholder: "you@example.com", type: "email" })}</div><AvatarDropzone value={values.profile.avatarUrl} onChange={url => setValue("profile.avatarUrl", url, { shouldDirty: true })} error={errorAt("profile.avatarUrl")} /><h3 className="form-subheading">{t("wizard.profile.socials.heading")}<span className="optional-label">{t("editor.optional")}</span></h3>{socials.fields.map((s, i) => <RepeatableCard key={s.id} title={t("wizard.profile.socials.heading")} index={i} onRemove={() => socials.remove(i)}><div className="field-grid">{field(`socials.${i}.label`, t("editor.label"), { placeholder: "GitHub" })}{field(`socials.${i}.url`, t("editor.url"), { placeholder: "https://github.com/you", type: "url" })}</div></RepeatableCard>)}<Button variant="secondary" disabled={socials.fields.length >= LIMITS.socialsMax} onClick={() => socials.append({ label: "", url: "" })}>{t("wizard.profile.socials.add")}</Button></div>}
        {step === 1 && <div className="form-stack">{skills.fields.map((s, i) => <RepeatableCard key={s.id} title={t("wizard.step.skills")} index={i} onRemove={() => skills.remove(i)}>{field(`skills.${i}.name`, t("editor.skillName"), { placeholder: "TypeScript", maxLength: 40 })}<div className="field-grid">{field(`skills.${i}.level`, t("editor.skillLevel"), { type: "number", hint: t("editor.skillLevelHint") })}{field(`skills.${i}.category`, t("editor.category"), { placeholder: "Frontend", maxLength: 30 })}</div></RepeatableCard>)}<Button variant="secondary" disabled={skills.fields.length >= LIMITS.skillsMax} onClick={() => skills.append({ name: "", level: 3, category: "" })}>{t("wizard.skills.add")}</Button></div>}
        {step === 2 && <div className="form-stack">{projects.fields.map((p, i) => <RepeatableCard key={p.id} title={t("wizard.projects.repeatable")} index={i} onRemove={() => projects.remove(i)}>{field(`projects.${i}.title`, t("wizard.projects.title"), { maxLength: 80 })}{field(`projects.${i}.description`, t("wizard.projects.description"), { area: true, maxLength: 600 })}<Field label={t("wizard.projects.techTags")} error={errorAt(`projects.${i}.techTags`)}><TagInput value={values.projects[i]?.techTags || []} onChange={tags => setValue(`projects.${i}.techTags`, tags, { shouldDirty: true })} /></Field><div className="field-grid">{field(`projects.${i}.repoUrl`, t("wizard.projects.repoUrl"), { type: "url", placeholder: "https://github.com/..." })}{field(`projects.${i}.liveUrl`, t("wizard.projects.liveUrl"), { type: "url", placeholder: "https://..." })}</div>{field(`projects.${i}.imageUrl`, t("wizard.projects.imageUrl"), { type: "url", placeholder: "https://..." })}<label className="checkbox-field"><input type="checkbox" {...register(`projects.${i}.featured`)} />{t("wizard.projects.featured")}</label></RepeatableCard>)}<Button variant="secondary" disabled={projects.fields.length >= LIMITS.projectsMax} onClick={() => projects.append({ title: "", description: "", techTags: [], repoUrl: "", liveUrl: "", imageUrl: "", featured: false })}>{t("wizard.projects.add")}</Button></div>}
        {step === 3 && <div className="form-stack">{experience.fields.map((x, i) => <RepeatableCard key={x.id} title={t("wizard.experience.repeatable")} index={i} onRemove={() => experience.remove(i)}><div className="field-grid">{field(`experience.${i}.company`, t("wizard.experience.company"), { maxLength: 80 })}{field(`experience.${i}.role`, t("wizard.experience.role"), { maxLength: 80 })}</div><div className="field-grid">{field(`experience.${i}.startDate`, t("wizard.experience.startDate"), { type: "month" })}{field(`experience.${i}.endDate`, t("wizard.experience.endDate"), { type: "month", disabled: values.experience[i]?.current })}</div><label className="checkbox-field"><input type="checkbox" {...register(`experience.${i}.current`)} />{t("wizard.experience.current")}</label>{field(`experience.${i}.location`, t("wizard.experience.location"))}<Field label={t("wizard.experience.highlights")} error={errorAt(`experience.${i}.highlights`)}><Textarea rows={3} defaultValue={values.experience[i]?.highlights.join("\n")} onChange={e => setValue(`experience.${i}.highlights`, e.target.value.split("\n").map(v => v.trim()).filter(Boolean), { shouldDirty: true })} /></Field></RepeatableCard>)}<Button variant="secondary" disabled={experience.fields.length >= LIMITS.experienceMax} onClick={() => experience.append({ company: "", role: "", startDate: "", endDate: "", current: false, location: "", highlights: [] })}>{t("wizard.experience.add")}</Button></div>}
        {step === 4 && <div className="form-stack">{events.fields.map((v, i) => <RepeatableCard key={v.id} title={t("wizard.events.repeatable")} index={i} onRemove={() => events.remove(i)}>{field(`events.${i}.title`, t("wizard.events.title"), { maxLength: 120 })}<div className="field-grid">{field(`events.${i}.role`, t("wizard.events.role"), { placeholder: t("wizard.events.role.placeholder") })}{field(`events.${i}.date`, t("wizard.events.date"), { type: "month" })}</div>{field(`events.${i}.description`, t("wizard.events.description"), { area: true, maxLength: 400 })}{field(`events.${i}.url`, t("wizard.events.url"), { type: "url", placeholder: "https://..." })}</RepeatableCard>)}<Button variant="secondary" disabled={events.fields.length >= LIMITS.eventsMax} onClick={() => events.append({ title: "", role: "", date: "", description: "", url: "" })}>{t("wizard.events.add")}</Button></div>}
        {step === 5 && <div className="form-stack">{awards.fields.map((a, i) => <RepeatableCard key={a.id} title={t("wizard.awards.repeatable")} index={i} onRemove={() => awards.remove(i)}>{field(`awards.${i}.title`, t("wizard.awards.title"), { maxLength: 120 })}<div className="field-grid">{field(`awards.${i}.issuer`, t("wizard.awards.issuer"))}{field(`awards.${i}.date`, t("wizard.awards.date"), { type: "month" })}</div>{field(`awards.${i}.result`, t("wizard.awards.result"), { placeholder: t("wizard.awards.result.placeholder") })}{field(`awards.${i}.description`, t("wizard.awards.description"), { area: true, maxLength: 400 })}</RepeatableCard>)}<Button variant="secondary" disabled={awards.fields.length >= LIMITS.awardsMax} onClick={() => awards.append({ title: "", issuer: "", date: "", result: "", description: "" })}>{t("wizard.awards.add")}</Button></div>}
        {step === 6 && <div className="form-stack"><div className="review-profile"><div className="review-avatar">{values.profile.fullName.split(" ").slice(0, 2).map(n => n[0]).join("") || "?"}</div><div><h3>{values.profile.fullName || "—"}</h3><p>{values.profile.headline || "—"}</p></div></div><dl className="review-summary">{["skills", "projects", "experience", "events", "awards"].map(s => <div key={s}><dt>{t(`wizard.review.${s}`)}</dt><dd>{(values[s as keyof PortfolioInput] as unknown[]).length}</dd></div>)}<div><dt>{t("wizard.review.theme")}</dt><dd>{t(`wizard.review.theme.${values.theme}`)}</dd></div></dl><p className="step-description">{t("editor.publishNote")}</p></div>}
        {error && <div className="error-banner" role="alert">{error}</div>}
      </div><div className="wizard-actions"><Button variant="secondary" disabled={step === 0 || submitting} onClick={() => goTo(step - 1)}><Icon name="arrow" size={14} className="back-arrow" />{t("wizard.review.back")}</Button><span>{step > 0 && step < 6 ? t("editor.optionalStep") : t("editor.madeByYou")}</span>{step < 6 ? <Button type="submit">{t("wizard.review.next")}<Icon name="arrow" size={14} /></Button> : <Button type="submit" disabled={submitting || (hasDraft && !draftResolved)}>{t(submitting ? "wizard.review.submitting" : "editor.publish")}<Icon name="globe" size={14} /></Button>}</div></form></div>
      <aside className="wizard-preview-panel"><div className="preview-panel-header"><span><i className="live-dot" />{t("editor.livePreview")}</span><small>{t("editor.previewHint")}</small></div><PortfolioPreview portfolio={values} /><div className="preview-theme-options" role="group" aria-label={t("wizard.review.theme")}>{THEMES.map(theme => <button type="button" key={theme} aria-pressed={values.theme === theme} onClick={() => setValue("theme", theme, { shouldDirty: true })}><span className={`theme-dot theme-${theme}`} />{t(`wizard.review.theme.${theme}`)}</button>)}</div><p className="preview-footnote">{t("editor.themeNote")}</p></aside>
    </div>
  </>;
}
