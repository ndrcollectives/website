"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Locale } from "@/lib/i18n/dictionaries";

const LABELS: Record<Locale, string> = {
  en: "EN",
  nl: "NL",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, dict } = useLanguage();
  const other: Locale = locale === "en" ? "nl" : "en";

  return (
    <button
      onClick={() => setLocale(other)}
      className={`flex items-center gap-1.5 rounded-lg p-2 text-sm font-medium hover:bg-surface-raised ${className ?? ""}`}
      aria-label={dict.language.label}
      title={dict.language.label}
    >
      <Languages className="h-5 w-5" />
      <span className="hidden sm:inline">{LABELS[locale]}</span>
    </button>
  );
}
