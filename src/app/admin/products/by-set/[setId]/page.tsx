import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuickListingForm } from "@/components/admin/quick-listing-form";
import { ConfirmSubmitForm } from "@/components/admin/confirm-submit-button";
import { formatPrice } from "@/lib/utils";
import { normalizeCardNumber } from "@/lib/card-number";
import { VARIANT_ORDER, variantFromTitle, patternFromTitle } from "@/lib/product-variant";
import {
  deleteProduct,
  resetBulkTierPricesForSet,
  updateProductInventory,
} from "../../actions";

type SearchParams = {
  repriced?: string;
  repriceScanned?: string;
};

export default async function AdminSetListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ setId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const { setId } = await params;
  const { repriced, repriceScanned } = await searchParams;
  const supabase = createAdminClient();

  const [{ data: set }, { data: cards }, { data: products }] = await Promise.all([
    supabase.from("sets").select("id, name, code").eq("id", setId).single(),
    supabase.from("cards").select("*").eq("set_id", setId),
    supabase.from("products").select("*").eq("set_id", setId),
  ]);

  if (!set) {
    return (
      <div>
        <p className="text-sm text-accent-red">Set not found.</p>
        <Link href="/admin/products" className="text-sm text-accent-blue hover:underline">
          &larr; Back to Products
        </Link>
      </div>
    );
  }

  // `number` is text (e.g. "4", "004/102"), so a plain DB text sort puts
  // "10" before "2" — sort numerically here, same as the public set page.
  const sortedCards = (cards ?? []).sort((a, b) =>
    a.number.localeCompare(b.number, undefined, { numeric: true }),
  );

  // Products imported before the catalog existed (e.g. CSV import) often
  // stored the full padded number ("004/165") while the synced catalog
  // stores just the printed number ("4") — normalize both sides so those
  // existing listings still show up grouped with their card.
  const productsByCardNumber = new Map<string, NonNullable<typeof products>>();
  for (const p of products ?? []) {
    if (!p.card_number) continue;
    const key = normalizeCardNumber(p.card_number);
    const list = productsByCardNumber.get(key) ?? [];
    list.push(p);
    productsByCardNumber.set(key, list);
  }
  // Insertion order otherwise depends on which variant happened to get
  // listed first — sort by print variant instead (Normal, then Reverse
  // Holofoil, Holofoil, 1st Edition) so a card's listings always appear
  // in the same order regardless of when each was added. Within Reverse
  // Holofoil, further sort by foil pattern name (e.g. "Energy Symbol
  // Pattern" before "Poke Ball") so multiple named-pattern listings for
  // the same card also land in a stable order.
  for (const list of productsByCardNumber.values()) {
    list.sort((a, b) => {
      const byVariant =
        VARIANT_ORDER.indexOf(variantFromTitle(a.title)) -
        VARIANT_ORDER.indexOf(variantFromTitle(b.title));
      if (byVariant !== 0) return byVariant;
      return (patternFromTitle(a.title) ?? "").localeCompare(patternFromTitle(b.title) ?? "");
    });
  }

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-accent-blue hover:underline">
        &larr; Back to Products
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{set.name} — Manage Listings</h1>
      <p className="mt-1 text-sm text-muted">
        {sortedCards.length} synced card{sortedCards.length === 1 ? "" : "s"}. Pick a variant,
        fill in a price and how many you have, and add — title and image come
        straight from the synced catalog.
      </p>

      {repriced !== undefined && (
        <div className="mt-4 rounded-lg border border-accent-yellow/40 bg-accent-yellow/10 p-3 text-sm text-accent-yellow">
          {repriced === "0"
            ? `Checked ${repriceScanned ?? 0} bulk-tier listing${repriceScanned === "1" ? "" : "s"} in ${set.name} — all already matched the default price table.`
            : `Repriced ${repriced} of ${repriceScanned ?? 0} bulk-tier listing${repriceScanned === "1" ? "" : "s"} in ${set.name} to match the current default price table.`}
        </div>
      )}

      <div className="mt-4">
        <ConfirmSubmitForm
          action={resetBulkTierPricesForSet}
          variant="secondary"
          hidden={{ set_id: set.id }}
          confirmMessage={`Reset the price of every Common/Uncommon/Rare/Double Rare listing in ${set.name} to the current default price table? This overwrites any price you set by hand on those listings. Illustration Rare and up are left untouched.`}
        >
          Sync {set.name} to Default Prices
        </ConfirmSubmitForm>
      </div>

      {sortedCards.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          No cards synced yet for this set — go back to{" "}
          <Link href="/admin/sets" className="text-accent-blue hover:underline">
            Set Manager
          </Link>{" "}
          and click &quot;Sync Cards&quot; first.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {sortedCards.map((card) => {
            const existing = productsByCardNumber.get(normalizeCardNumber(card.number)) ?? [];
            const image = card.image_small ?? card.image_large;
            return (
              <div
                key={card.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-start"
              >
                <div className="flex shrink-0 items-center gap-3 sm:w-56">
                  {image && (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface-raised">
                      <Image src={image} alt={card.name} fill className="object-contain" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{card.name}</p>
                    <p className="text-xs text-muted">
                      #{card.number}
                      {card.rarity ? ` · ${card.rarity}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  {existing.length > 0 && (
                    <div className="space-y-1">
                      {existing.map((p) => (
                        <div
                          key={p.id}
                          className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-raised px-3 py-2 text-xs"
                        >
                          <span className="font-medium">{p.title}</span>
                          <span className="text-muted">{formatPrice(p.price_cents)}</span>
                          <form
                            action={updateProductInventory}
                            className="flex items-center gap-1"
                          >
                            <input type="hidden" name="id" value={p.id} />
                            <Input
                              name="inventory_count"
                              type="number"
                              defaultValue={p.inventory_count}
                              className="h-7 w-16"
                            />
                            <Button size="sm" variant="secondary" type="submit">
                              Save
                            </Button>
                          </form>
                          <form action={deleteProduct}>
                            <input type="hidden" name="id" value={p.id} />
                            <Button size="sm" variant="destructive" type="submit">
                              Delete
                            </Button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}

                  <QuickListingForm
                    setId={set.id}
                    cardNumber={card.number}
                    cardName={card.name}
                    rarity={card.rarity}
                    image={image}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
