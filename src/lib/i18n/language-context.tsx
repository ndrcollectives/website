"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  defaultLocale,
  getDictionary,
  LANGUAGE_COOKIE,
  type Dictionary,
  type Locale,
} from "@/lib/i18n/dictionaries";
import { useConsent } from "@/lib/consent-context";

type LanguageContextValue = {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? defaultLocale);
  const router = useRouter();
  const { status } = useConsent();

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dict: getDictionary(locale),
      setLocale: (next: Locale) => {
        setLocaleState(next);
        // Preference cookies are opt-in. With consent this persists across
        // visits; without it, fall back to a session-only cookie (no
        // max-age) so the switch still takes effect for server-rendered
        // pages this visit — it's just gone once the browser session ends.
        const persistence = status === "accepted" ? "; max-age=31536000" : "";
        document.cookie = `${LANGUAGE_COOKIE}=${next}; path=/${persistence}; SameSite=Lax`;
        // Server components (pages using getLocale()) only re-read the
        // cookie on a fresh render, so nudge one to pick up the new locale.
        router.refresh();
      },
    }),
    [locale, router, status],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
