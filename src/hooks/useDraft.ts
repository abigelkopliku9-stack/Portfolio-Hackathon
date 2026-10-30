"use client";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
const DEFAULT_DRAFT_KEY = "portfolio-draft-v1";
const DRAFT_EVENT = "portfolio-draft-change";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(DRAFT_EVENT, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(DRAFT_EVENT, callback); };
}
export function useDraft<T>(storageKey = DEFAULT_DRAFT_KEY) {
  const snapshot = useCallback(() => {
    try { return window.localStorage.getItem(storageKey); } catch { return null; }
  }, [storageKey]);
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const load = useCallback((): T | null => {
    try { const value = snapshot(); return value ? JSON.parse(value) as T : null; } catch { return null; }
  }, [snapshot]);
  const save = useCallback((value: T) => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(value)); window.dispatchEvent(new Event(DRAFT_EVENT)); } catch { /* Editing remains available with browser storage disabled. */ }
  }, [storageKey]);
  const clear = useCallback(() => {
    try { window.localStorage.removeItem(storageKey); window.dispatchEvent(new Event(DRAFT_EVENT)); } catch { /* Browser storage may be disabled. */ }
  }, [storageKey]);
  return { hasDraft: raw !== null, load, save, clear };
}
export function useDebouncedSave<T>(save: (value: T) => void, delay = 450) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<T | undefined>(undefined);
  const saveRef = useRef(save);
  useEffect(() => { saveRef.current = save; }, [save]);
  const cancel = useCallback(() => { if (timer.current) clearTimeout(timer.current); timer.current = null; pending.current = undefined; }, []);
  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (pending.current !== undefined) saveRef.current(pending.current);
    pending.current = undefined; timer.current = null;
  }, []);
  const schedule = useCallback((value: T) => {
    if (timer.current) clearTimeout(timer.current);
    pending.current = value;
    timer.current = setTimeout(flush, delay);
  }, [delay, flush]);
  useEffect(() => {
    window.addEventListener("pagehide", flush);
    return () => { window.removeEventListener("pagehide", flush); flush(); };
  }, [flush]);
  return { schedule, cancel, flush };
}
