"use client";
import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { t, type Locale, LOCALES } from "@/lib/i18n";
const EVENT = "portfolio-locale-change";
let memoryLocale: Locale | undefined;
function subscribe(callback: () => void) { window.addEventListener("storage", callback); window.addEventListener(EVENT, callback); return () => { window.removeEventListener("storage", callback); window.removeEventListener(EVENT, callback); }; }
function getLocale(): Locale {
  try { const value = localStorage.getItem("locale"); if (LOCALES.includes(value as Locale)) return value as Locale; } catch { /* Use the in-memory preference if storage is disabled. */ }
  return memoryLocale || "en";
}
const LocaleContext = createContext<{ locale: Locale; setLocale: (l: Locale) => void; t: (key: string) => string }>({ locale: "en", setLocale: () => {}, t: key => t(key, "en") });
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getLocale, () => "en" as Locale);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  function setLocale(value: Locale) {
    memoryLocale = value;
    try { localStorage.setItem("locale", value); document.cookie = `locale=${value};path=/;max-age=31536000;SameSite=Lax`; } catch { /* The current session still changes language. */ }
    window.dispatchEvent(new Event(EVENT));
  }
  return <LocaleContext.Provider value={{ locale, setLocale, t: key => t(key, locale) }}>{children}</LocaleContext.Provider>;
}
export function useLocale() { return useContext(LocaleContext); }
export function useT() { return useContext(LocaleContext).t; }
