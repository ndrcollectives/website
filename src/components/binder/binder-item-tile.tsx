import Image from "next/image";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { getSuggestedPriceCents } from "@/lib/default-prices";
import { updateBinderItemQuantity, removeBinderItem } from "@/app/account/binder/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { BinderItem } from "@/lib/types";

export function BinderItemTile({ item, dict }: { item: BinderItem; dict: Dictionary }) {
  const card = item.card;
  const image = card?.image_small ?? card?.image_large ?? null;
  const unitCents = getSuggestedPriceCents(card?.rarity, item.variant);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="relative aspect-[5/7] bg-surface-raised">
        {image ? (
          <Image src={image} alt={card?.name ?? "Card"} fill className="object-contain p-2" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">
            No image
          </div>
        )}
        <span className="absolute right-2 top-2 rounded-full bg-surface/90 px-2 py-0.5 text-xs font-semibold backdrop-blur">
          &times;{item.quantity}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {card?.rarity && <RarityBadge rarity={card.rarity} className="w-fit" />}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {card?.name ?? "Unknown card"}
        </h3>
        <p className="text-xs text-muted">
          {item.variant}
          {item.condition ? ` · ${item.condition}` : ""}
        </p>
        <p className="text-sm font-semibold text-accent-yellow">
          {formatPrice(unitCents * item.quantity)}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <form action={updateBinderItemQuantity} className="flex items-center gap-1">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="binder_id" value={item.binder_id} />
            <Input
              name="quantity"
              type="number"
              min={1}
              defaultValue={item.quantity}
              className="h-8 w-16"
            />
            <Button size="sm" variant="secondary" type="submit">
              {dict.binder.save}
            </Button>
          </form>
          <form action={removeBinderItem}>
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="binder_id" value={item.binder_id} />
            <Button size="sm" variant="destructive" type="submit">
              {dict.binder.remove}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
