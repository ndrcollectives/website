"use client";

import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { useLanguage } from "@/lib/i18n/language-context";

export function ThemePreference() {
  const { theme, setTheme } = useTheme();
  const { dict } = useLanguage();

  const options: { value: Theme; label: string }[] = [
    { value: "dark", label: dict.theme.dark },
    { value: "light", label: dict.theme.light },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setTheme(opt.value)}
          className={cn(
            "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            opt.value === theme
              ? "border-accent-yellow bg-accent-yellow/10 text-foreground"
              : "border-border hover:border-accent-yellow/60",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
