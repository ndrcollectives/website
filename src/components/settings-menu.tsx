"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { locales, type Locale } from "@/lib/i18n/dictionaries";

const LANG_NAMES: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
};

// True only once mounted on the client — createPortal needs document.body,
// which doesn't exist during SSR. useSyncExternalStore (rather than an
// effect calling setState) is React's recommended way to read this without
// triggering a cascading render.
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale, dict } = useLanguage();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Guards the desktop popover only — the mobile drawer below closes via
    // its own backdrop click instead.
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

  const languageSection = (
    <>
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
    </>
  );

  const themeSection = (
    <>
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
    </>
  );

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

      {/* Desktop: compact anchored popover — plenty of room there, no need
          for a full drawer. */}
      {open && (
        <div className="absolute right-0 z-40 mt-2 hidden w-60 rounded-lg border border-border bg-surface-raised/95 p-3 shadow-lg backdrop-blur-xl md:block">
          {languageSection}
          {themeSection}
        </div>
      )}

      {/* Mobile: slide-in drawer matching the nav drawer's pattern.
          Portaled to <body> so it escapes the header's backdrop-blur
          containing block, which would otherwise trap a `fixed`
          descendant inside the 64px header bar (see navbar.tsx). */}
      {mounted &&
        createPortal(
          <div className="md:hidden">
            {open && (
              <div
                className="fixed inset-0 z-40 bg-black/60"
                onClick={() => setOpen(false)}
                aria-hidden
              />
            )}
            <aside
              className={`fixed right-0 top-0 z-50 h-full w-64 max-w-[80vw] transform border-l border-border bg-surface transition-transform duration-300 ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="font-semibold">{dict.nav.settings}</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 hover:bg-surface-raised"
                  aria-label={dict.nav.settings}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                {languageSection}
                {themeSection}
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </div>
  );
}
