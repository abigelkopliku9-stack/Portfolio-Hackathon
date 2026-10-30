"use client";

import * as React from "react";
import { useState } from "react";

// lucide-react may not be installed; use inline SVG fallbacks instead.
function IconPlus() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
    </svg>
  );
}

export function RepeatableCard({
  title,
  index,
  onRemove,
  children,
  defaultOpen = true,
}: {
  title: string;
  index: number;
  onRemove: () => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          {open ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          )}
          {title} #{index + 1}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-slate-400 transition hover:text-rose-600"
          aria-label="Remove"
        >
          <IconTrash />
        </button>
      </div>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  );
}

// Avoid unused import warnings for lucide by re-exporting nothing.
export { IconPlus as AddIcon };
