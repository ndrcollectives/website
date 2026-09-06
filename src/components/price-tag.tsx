import { cn, formatPrice } from "@/lib/utils";

export function PriceTag({
  cents,
  mainClassName,
  className,
}: {
  cents: number;
  mainClassName?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span className={mainClassName}>{formatPrice(cents)}</span>
    </span>
  );
}
