"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { t, type Locale, LOCALES, LOCALE_LABELS } from "@/lib/i18n";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}>({
  locale: "en",
  setLocale: () => {},
  t: (key) => t(key, "en"),
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("locale");
      if (stored && (LOCALES as string[]).includes(stored)) {
        setLocaleState(stored as Locale);
      }
    } catch {
      // ignore
    }
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    try {
      window.localStorage.setItem("locale", l);
      document.cookie = `locale=${l};path=/;max-age=31536000`;
    } catch {
      // ignore
    }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: (key) => t(key, locale) }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useT() {
  return useContext(LocaleContext).t;
}
