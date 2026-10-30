"use client";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
export function RepeatableCard({ title, index, onRemove, children, defaultOpen = true }: { title: string; index: number; onRemove: () => void; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <div className="repeatable-card"><div className="repeatable-header"><button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open}><Icon name="chevron" size={13} style={{ transform: open ? "rotate(90deg)" : undefined }} />{title} {String(index + 1).padStart(2, "0")}</button><button type="button" onClick={onRemove} aria-label={`Remove ${title} ${index + 1}`}>Remove ×</button></div>{open && <div className="repeatable-body">{children}</div>}</div>;
}
