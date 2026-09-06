"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/lib/consent-context";
import { useLanguage } from "@/lib/i18n/language-context";

export function CookieBanner() {
  const { status, setStatus } = useConsent();
  const { dict } = useLanguage();

  if (status !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/98 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold">{dict.cookies.bannerTitle}</p>
          <p className="mt-1 text-xs text-muted">
            {dict.cookies.bannerBody}{" "}
            <Link href="/cookies" className="text-accent-blue hover:underline">
              {dict.cookies.manage}
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 min-[420px]:flex-row sm:shrink-0">
          <Button
            variant="secondary"
            className="w-full min-[420px]:w-auto"
            onClick={() => setStatus("rejected")}
          >
            {dict.cookies.reject}
          </Button>
          <Button className="w-full min-[420px]:w-auto" onClick={() => setStatus("accepted")}>
            {dict.cookies.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
