import { cn } from "@/lib/utils";
import { getRarityBadgeClassName } from "@/lib/rarity";

export function RarityBadge({
  rarity,
  className,
}: {
  rarity: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        getRarityBadgeClassName(rarity),
        className,
      )}
    >
      {rarity}
    </span>
  );
}
