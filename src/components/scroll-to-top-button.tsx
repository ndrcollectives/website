"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConsent } from "@/lib/consent-context";
import { useLanguage } from "@/lib/i18n/language-context";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const { status } = useConsent();
  const { dict } = useLanguage();

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={dict.scrollToTop.label}
      title={dict.scrollToTop.label}
      className={cn(
        "fixed right-4 z-40 rounded-full border border-border bg-surface-raised p-3 text-foreground shadow-lg transition-all duration-200 hover:border-accent-yellow/60 hover:bg-surface sm:right-6",
        // Shifted up while the cookie banner (a full-width bottom bar) is
        // showing so the two never overlap.
        status === null ? "bottom-24 sm:bottom-28" : "bottom-6",
        visible ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
