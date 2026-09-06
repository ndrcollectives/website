"use client";

import { useSyncExternalStore } from "react";
import { useConsent } from "@/lib/consent-context";

export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "ndr-theme";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): Theme {
  // The current toggle state always lands on the <html> dataset attribute
  // (see setTheme below), even when consent forbids persisting it to
  // localStorage — so that's the source of truth once it's been set at
  // least once this page view. Before that, fall back to whatever was
  // persisted from a prior, consented visit.
  const applied = document.documentElement.dataset.theme;
  if (applied === "light" || applied === "dark") return applied;
  return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
}

// Matches the default the site renders with before the theme-init script
// (see layout.tsx) picks a stored preference — keeps hydration in sync.
function getServerSnapshot(): Theme {
  return "dark";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { status } = useConsent();

  function setTheme(next: Theme) {
    document.documentElement.dataset.theme = next;
    // Preference cookies/storage are opt-in — without consent the choice
    // still applies for this page view, it just won't survive a reload.
    if (status === "accepted") {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    }
    window.dispatchEvent(new Event("storage"));
  }

  return { theme, setTheme };
}
