"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { locales, type Locale } from "@/lib/i18n/dictionaries";

const NAMES: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
};

export function LanguagePreference() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex gap-2">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={cn(
            "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            l === locale
              ? "border-accent-yellow bg-accent-yellow/10 text-foreground"
              : "border-border hover:border-accent-yellow/60",
          )}
        >
          {NAMES[l]}
        </button>
      ))}
    </div>
  );
}
