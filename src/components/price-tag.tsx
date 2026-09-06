"use client";

import { cn, formatEUR, formatPrice } from "@/lib/utils";
import { useEurRate } from "@/hooks/use-eur-rate";

// Shows the real USD price plus an approximate "≈ €X.XX" underneath —
// USD stays the actual currency (what Stripe charges), EUR is a display
// convenience for euro-zone shoppers.
export function PriceTag({
  cents,
  mainClassName,
  eurClassName,
  className,
}: {
  cents: number;
  mainClassName?: string;
  eurClassName?: string;
  className?: string;
}) {
  const rate = useEurRate();

  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span className={mainClassName}>{formatPrice(cents)}</span>
      {rate != null && (
        <span className={cn("text-xs text-muted", eurClassName)}>
          ≈ {formatEUR(cents, rate)}
        </span>
      )}
    </span>
  );
}
