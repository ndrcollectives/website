"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage } from "@/lib/i18n/language-context";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { dict } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={
        className ??
        "flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-accent-yellow/60 hover:bg-surface-raised"
      }
      aria-label={dict.theme.toggle}
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      <span>{theme === "light" ? dict.theme.light : dict.theme.dark}</span>
    </button>
  );
}
