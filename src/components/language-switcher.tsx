"use client";

import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Locale } from "@/lib/i18n/dictionaries";

const LABELS: Record<Locale, string> = {
  en: "EN",
  nl: "NL",
};

export function LanguageSwitcher({
  className,
  iconOnly,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  const { locale, setLocale, dict } = useLanguage();
  const other: Locale = locale === "en" ? "nl" : "en";

  return (
    <button
      onClick={() => setLocale(other)}
      className={cn(
        iconOnly
          ? "rounded-lg p-2 hover:bg-surface-raised"
          : "flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-accent-yellow/60 hover:bg-surface-raised",
        className,
      )}
      aria-label={dict.language.label}
      title={dict.language.label}
    >
      <Languages className="h-4 w-4" />
      {!iconOnly && <span>{LABELS[locale]}</span>}
    </button>
  );
}
