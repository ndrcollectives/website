"use client";

import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { locales, type Locale } from "@/lib/i18n/dictionaries";

const LANG_NAMES: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
};

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale, dict } = useLanguage();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeOptions: { value: Theme; label: string }[] = [
    { value: "dark", label: dict.theme.dark },
    { value: "light", label: dict.theme.light },
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 hover:bg-surface-raised"
        aria-label={dict.nav.settings}
        aria-expanded={open}
      >
        <Settings className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-60 rounded-lg border border-border bg-surface-raised/80 p-3 shadow-lg backdrop-blur-md">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {dict.language.label}
          </p>
          <div className="flex gap-2">
            {locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                className={cn(
                  "flex-1 rounded-lg border px-2 py-1.5 text-sm font-medium transition-colors",
                  l === locale
                    ? "border-accent-yellow bg-accent-yellow/10 text-foreground"
                    : "border-border hover:border-accent-yellow/60",
                )}
              >
                {LANG_NAMES[l]}
              </button>
            ))}
          </div>

          <p className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
            {dict.accountPreferences.themeTitle}
          </p>
          <div className="flex gap-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex-1 rounded-lg border px-2 py-1.5 text-sm font-medium transition-colors",
                  opt.value === theme
                    ? "border-accent-yellow bg-accent-yellow/10 text-foreground"
                    : "border-border hover:border-accent-yellow/60",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
