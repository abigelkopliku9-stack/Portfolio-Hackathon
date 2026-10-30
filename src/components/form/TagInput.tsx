"use client";
import { useState } from "react";
import { Input, Button } from "@/components/ui/FormControls";
import { LIMITS } from "@/lib/validation/portfolio.schema";
export function TagInput({ value, onChange, placeholder = "Type and press Enter", id }: { value: string[]; onChange: (next: string[]) => void; placeholder?: string; id?: string }) {
  const [draft, setDraft] = useState("");
  function add() { const tag = draft.trim(); if (!tag || value.length >= LIMITS.techTagsMax) return; if (!value.includes(tag)) onChange([...value, tag]); setDraft(""); }
  return <div><div className="flex gap-2"><Input id={id} value={draft} maxLength={30} placeholder={placeholder} onChange={e => setDraft(e.target.value)} onBlur={add} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } else if (e.key === "Backspace" && !draft) onChange(value.slice(0, -1)); }} /><Button variant="secondary" onClick={add} disabled={!draft.trim() || value.length >= LIMITS.techTagsMax}>Add</Button></div>{value.length > 0 && <div className="tag-list">{value.map(tag => <span key={tag}>{tag}<button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter(t => t !== tag))}>×</button></span>)}</div>}</div>;
}
