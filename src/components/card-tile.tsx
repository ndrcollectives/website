import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { RarityBadge } from "@/components/ui/rarity-badge";
import type { Card, Set } from "@/lib/types";

// A synced card with no matching product listing — shown in the shop grid
// alongside real listings so browsing a set shows every card in it, not
// just the ones someone happens to have for sale.
export function CardTile({ card, set }: { card: Card; set: Set | null }) {
  const image = card.image_large ?? card.image_small;
  const content = (
    <>
      <div className="holo-card relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-surface-raised">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={card.name}
            loading="lazy"
            className="max-h-full w-auto max-w-full opacity-60 grayscale transition-opacity group-hover:opacity-80"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">
            No image
          </div>
        )}
        <Badge variant="default" className="absolute left-2 top-2">
          Unavailable
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {card.rarity && <RarityBadge rarity={card.rarity} className="w-fit" />}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-muted">
          {card.name}
        </h3>
        <p className="text-xs text-muted">
          #{card.number}
          {set ? ` · ${set.name}` : ""}
        </p>
        <p className="mt-auto pt-2 text-xs font-medium text-muted">Not currently for sale</p>
      </div>
    </>
  );

  if (!set) {
    return (
      <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface opacity-90">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/sets/${set.code}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface opacity-90 transition-colors hover:border-border hover:opacity-100"
    >
      {content}
    </Link>
  );
}
