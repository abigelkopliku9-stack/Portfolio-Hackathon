"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_DRAFT_KEY = "portfolio-draft-v1";

/**
 * Tiny autosave helper for the create/edit form.
 * Pass a `storageKey` to keep drafts separate per portfolio (edit mode).
 */
export function useDraft<T>(storageKey?: string) {
  const key = storageKey ?? DEFAULT_DRAFT_KEY;
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    try {
      setHasDraft(window.localStorage.getItem(key) !== null);
    } catch {
      setHasDraft(false);
    }
  }, [key]);

  const load = useCallback((): T | null => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, [key]);

  const save = useCallback(
    (value: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        setHasDraft(true);
      } catch {
        // storage full / disabled — silently ignore
      }
    },
    [key],
  );

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setHasDraft(false);
    } catch {
      // ignore
    }
  }, [key]);

  return { hasDraft, load, save, clear };
}

export function useDebouncedSave<T>(save: (value: T) => void, delay = 600) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (value: T) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => save(value), delay);
    },
    [save, delay],
  );
}
