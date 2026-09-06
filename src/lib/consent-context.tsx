"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { CONSENT_COOKIE, type ConsentChoice, type ConsentStatus } from "@/lib/consent";
import { LANGUAGE_COOKIE } from "@/lib/i18n/dictionaries";
import { THEME_STORAGE_KEY } from "@/hooks/use-theme";

type ConsentContextValue = {
  status: ConsentStatus;
  setStatus: (choice: ConsentChoice) => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({
  initialStatus,
  children,
}: {
  initialStatus: ConsentStatus;
  children: React.ReactNode;
}) {
  const [status, setStatusState] = useState<ConsentStatus>(initialStatus);

  const value = useMemo<ConsentContextValue>(
    () => ({
      status,
      setStatus: (choice: ConsentChoice) => {
        setStatusState(choice);
        document.cookie = `${CONSENT_COOKIE}=${choice}; path=/; max-age=31536000; SameSite=Lax`;
        if (choice === "rejected") {
          // Honor the rejection immediately: forget any preference data
          // already stored from before the decision (or before this
          // banner existed).
          document.cookie = `${LANGUAGE_COOKIE}=; path=/; max-age=0`;
          try {
            window.localStorage.removeItem(THEME_STORAGE_KEY);
          } catch {
            // Storage can be unavailable (private mode, blocked) — nothing
            // to clean up in that case.
          }
        }
      },
    }),
    [status],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within a ConsentProvider");
  return ctx;
}
