import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { createProductFromCard, deleteProduct, updateProductInventory } from "../../actions";

const VARIANTS = ["Normal", "Reverse Holofoil", "Holofoil", "1st Edition"];

export default async function AdminSetListingsPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  await requireAdmin();
  const { setId } = await params;
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
        <Link href="/admin/sets" className="text-sm text-accent-blue hover:underline">
          &larr; Back to Sets
        </Link>
      </div>
    );
  }

  // `number` is text (e.g. "4", "004/102"), so a plain DB text sort puts
  // "10" before "2" — sort numerically here, same as the public set page.
  const sortedCards = (cards ?? []).sort((a, b) =>
    a.number.localeCompare(b.number, undefined, { numeric: true }),
  );

  const productsByCardNumber = new Map<string, NonNullable<typeof products>>();
  for (const p of products ?? []) {
    if (!p.card_number) continue;
    const list = productsByCardNumber.get(p.card_number) ?? [];
    list.push(p);
    productsByCardNumber.set(p.card_number, list);
  }

  return (
    <div>
      <Link href="/admin/sets" className="text-sm text-accent-blue hover:underline">
        &larr; Back to Sets
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{set.name} — Manage Listings</h1>
      <p className="mt-1 text-sm text-muted">
        {sortedCards.length} synced card{sortedCards.length === 1 ? "" : "s"}. Pick a variant,
        fill in a price and how many you have, and add — title and image come
        straight from the synced catalog.
      </p>

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
            const existing = productsByCardNumber.get(card.number) ?? [];
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

                  <form action={createProductFromCard} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="set_id" value={set.id} />
                    <input type="hidden" name="card_number" value={card.number} />
                    <input type="hidden" name="card_name" value={card.name} />
                    <input type="hidden" name="rarity" value={card.rarity ?? ""} />
                    <input type="hidden" name="image" value={image ?? ""} />
                    <Select name="variant" defaultValue="Normal" className="h-9 w-40">
                      {VARIANTS.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </Select>
                    <Input
                      name="price"
                      type="number"
                      step="0.01"
                      placeholder="Price (€)"
                      required
                      className="h-9 w-24"
                    />
                    <Input
                      name="quantity"
                      type="number"
                      placeholder="Qty"
                      required
                      className="h-9 w-20"
                    />
                    <Button size="sm" type="submit">
                      Add Listing
                    </Button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
