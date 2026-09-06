"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/lib/consent-context";
import { useLanguage } from "@/lib/i18n/language-context";

export function CookiePreferences() {
  const { status, setStatus } = useConsent();
  const { dict } = useLanguage();

  const statusText =
    status === "accepted"
      ? dict.cookies.statusAccepted
      : status === "rejected"
        ? dict.cookies.statusRejected
        : dict.cookies.statusUndecided;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold">{dict.cookies.necessaryTitle}</h3>
          <span className="flex items-center gap-1 rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-muted">
            <Check className="h-3.5 w-3.5" />
            {dict.cookies.alwaysOn}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted">{dict.cookies.necessaryBody}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold">{dict.cookies.preferencesTitle}</h3>
          {status === "accepted" ? (
            <span className="flex items-center gap-1 rounded-full bg-accent-yellow/15 px-2.5 py-1 text-xs font-medium text-accent-yellow">
              <Check className="h-3.5 w-3.5" />
            </span>
          ) : status === "rejected" ? (
            <span className="flex items-center gap-1 rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-muted">
              <X className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-muted">{dict.cookies.preferencesBody}</p>

        <p className="mt-4 text-xs text-muted">{statusText}</p>
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant={status === "accepted" ? "secondary" : "default"}
            onClick={() => setStatus("accepted")}
          >
            {dict.cookies.acceptPreferences}
          </Button>
          <Button
            size="sm"
            variant={status === "rejected" ? "secondary" : "outline"}
            onClick={() => setStatus("rejected")}
          >
            {dict.cookies.rejectPreferences}
          </Button>
        </div>
      </div>
    </div>
  );
}
