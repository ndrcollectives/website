import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/paginate";
import { formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProductTable } from "@/components/admin/product-table";
import { ConfirmSubmitForm } from "@/components/admin/confirm-submit-button";
import { backfillProductImages, createProduct, resetBulkTierPrices } from "./actions";

type SearchParams = {
  backfilled?: string;
  noNumberMatch?: string;
  unsyncedSets?: string;
  repriced?: string;
  repriceScanned?: string;
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const { backfilled, noNumberMatch, unsyncedSets, repriced, repriceScanned } =
    await searchParams;
  const supabase = createAdminClient();

  const [{ data: products }, { data: sets }, cardSetIds] = await Promise.all([
    supabase
      .from("products")
      .select("*, set:sets(name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("sets")
      .select("id, name, code, era, release_date")
      .order("release_date", { ascending: false }),
    fetchAllRows<{ set_id: string }>((from, to) =>
      supabase.from("cards").select("set_id").range(from, to),
    ),
  ]);

  const cardCountBySetId = new Map<string, number>();
  for (const { set_id } of cardSetIds) {
    cardCountBySetId.set(set_id, (cardCountBySetId.get(set_id) ?? 0) + 1);
  }

  type ProductRow = {
    id: string;
    title: string;
    price_cents: number;
    inventory_count: number;
    images: string[];
  };
  type ProductGroup = {
    key: string;
    setId: string | null;
    setName: string;
    products: ProductRow[];
  };

  const groupsByKey = new Map<string, ProductGroup>();
  for (const p of products ?? []) {
    const key = p.set_id ?? "none";
    const row: ProductRow = {
      id: p.id,
      title: p.title,
      price_cents: p.price_cents,
      inventory_count: p.inventory_count,
      images: p.images ?? [],
    };
    const group = groupsByKey.get(key);
    if (group) {
      group.products.push(row);
    } else {
      groupsByKey.set(key, {
        key,
        setId: p.set_id,
        setName: p.set?.name ?? "No set",
        products: [row],
      });
    }
  }
  const groups = Array.from(groupsByKey.values()).sort((a, b) =>
    a.setName.localeCompare(b.setName),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">Product Manager</h1>

      <section className="mt-6 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-semibold">List Singles from a Set</h2>
        <p className="mt-1 text-xs text-muted">
          Pick a set below to browse its full card catalog and fill in a
          price + quantity per card you have — image and title come from the
          synced card straight away, no separate image fixing needed. Sets
          with no card count yet need syncing first on{" "}
          <Link href="/admin/sets" className="text-accent-blue hover:underline">
            Set Manager
          </Link>
          .
        </p>
        <div className="mt-3 space-y-3">
          {sets?.map((s) => {
            const cardCount = cardCountBySetId.get(s.id) ?? 0;
            return (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-raised p-4"
              >
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-muted">
                    {s.era} &middot; {formatDate(s.release_date)} &middot;{" "}
                    <span className={cardCount === 0 ? "text-accent-red" : undefined}>
                      {cardCount === 0 ? "not synced" : `${cardCount} cards`}
                    </span>
                  </p>
                  <Link
                    href={`/sets/${s.code}`}
                    className="text-sm text-accent-blue hover:underline"
                  >
                    View card list &rarr;
                  </Link>
                </div>
                <Link
                  href={`/admin/products/by-set/${s.id}`}
                  className={buttonVariants({ size: "sm", variant: "secondary" })}
                >
                  Manage Listings
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {backfilled && (
        <div className="mt-4 rounded-lg border border-accent-yellow/40 bg-accent-yellow/10 p-3 text-sm text-accent-yellow">
          <p>
            {backfilled === "0"
              ? "No listings needed fixing — everything with a matching card already has an image."
              : `Added an image to ${backfilled} listing${backfilled === "1" ? "" : "s"} from the synced card catalog.`}
          </p>
          {unsyncedSets && (
            <p className="mt-1 text-xs">
              Still missing: these sets have no cards synced yet — sync cards
              for them on the Sets page, then run this again: {unsyncedSets}.
            </p>
          )}
          {noNumberMatch && (
            <p className="mt-1 text-xs">
              Still missing: {noNumberMatch} listing{noNumberMatch === "1" ? "" : "s"} whose
              card number wasn&apos;t found in an otherwise-synced set (often
              secret rares/promos numbered past the set&apos;s printed total).
            </p>
          )}
        </div>
      )}

      <form action={backfillProductImages} className="mt-6">
        <Button type="submit" variant="secondary">
          Fix Missing Images
        </Button>
        <p className="mt-2 text-xs text-muted">
          Adds artwork from the synced card catalog to any listing that has a
          set + card number but no image yet — safe to run anytime, only
          touches listings with no image.
        </p>
      </form>

      {repriced !== undefined && (
        <div className="mt-4 rounded-lg border border-accent-yellow/40 bg-accent-yellow/10 p-3 text-sm text-accent-yellow">
          {repriced === "0"
            ? `Checked ${repriceScanned ?? 0} bulk-tier listing${repriceScanned === "1" ? "" : "s"} — all already matched the default price table.`
            : `Repriced ${repriced} of ${repriceScanned ?? 0} bulk-tier listing${repriceScanned === "1" ? "" : "s"} to match the current default price table.`}
        </div>
      )}

      <div className="mt-6">
        <ConfirmSubmitForm
          action={resetBulkTierPrices}
          variant="secondary"
          confirmMessage="Reset the price of every Common/Uncommon/Rare/Double Rare single to the current default price table? This overwrites any price you set by hand on those listings. Illustration Rare and up are left untouched."
        >
          Reset Bulk-Tier Prices
        </ConfirmSubmitForm>
        <p className="mt-2 text-xs text-muted">
          Overwrites the price of every single-card listing in Common,
          Uncommon, Rare, Rare Holo, and Double Rare to match{" "}
          <code className="text-[11px]">src/lib/default-prices.ts</code> —
          including ones you priced by hand. Illustration Rare and up are
          never touched, since that pricing data is much rougher.
        </p>
      </div>

      <form
        action={createProduct}
        className="mt-6 grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2"
      >
        <Input name="title" placeholder="Title" required className="sm:col-span-2" />
        <Select name="product_type" required defaultValue="single">
          <option value="single">Single</option>
          <option value="sealed_box">Booster Box</option>
          <option value="etb">Elite Trainer Box</option>
          <option value="pack">Booster Pack</option>
          <option value="graded_slab">Graded Slab</option>
        </Select>
        <Select name="set_id" defaultValue="">
          <option value="">No set</option>
          {sets?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Input name="card_number" placeholder="Card # (e.g. 004/102)" />
        <Input name="rarity" placeholder="Rarity" />
        <Input name="condition" placeholder="Condition (NM, LP, ...)" />
        <Input name="price" type="number" step="0.01" placeholder="Price (€)" required />
        <Input name="compare_at_price" type="number" step="0.01" placeholder="Compare-at price (€)" />
        <Input name="inventory_count" type="number" placeholder="Inventory count" />
        <Input
          name="images"
          placeholder="Image URLs, comma separated"
          className="sm:col-span-2"
        />
        <Input name="description" placeholder="Description" className="sm:col-span-2" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_preorder" /> Pre-order
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" /> Featured
        </label>
        <Button type="submit" className="sm:col-span-2">
          Add Product
        </Button>
      </form>

      <ProductTable groups={groups} />
    </div>
  );
}
