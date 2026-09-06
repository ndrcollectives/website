import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/admin/product-table";
import { backfillProductImages, createProduct, importProductsCsv } from "./actions";

type SearchParams = {
  imported?: string;
  importError?: string;
  skippedDuplicate?: string;
  skippedNoPrice?: string;
  importedWithoutSet?: string;
  backfilled?: string;
  noNumberMatch?: string;
  unsyncedSets?: string;
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const {
    imported,
    importError,
    skippedDuplicate,
    skippedNoPrice,
    importedWithoutSet,
    backfilled,
    noNumberMatch,
    unsyncedSets,
  } = await searchParams;
  const supabase = createAdminClient();

  const [{ data: products }, { data: sets }] = await Promise.all([
    supabase
      .from("products")
      .select("*, set:sets(name)")
      .order("created_at", { ascending: false }),
    supabase.from("sets").select("id, name").order("name"),
  ]);

  type ProductRow = {
    id: string;
    title: string;
    price_cents: number;
    inventory_count: number;
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

      {imported && (
        <div className="mt-4 rounded-lg border border-accent-yellow/40 bg-accent-yellow/10 p-3 text-sm text-accent-yellow">
          <p>Imported {imported} product{imported === "1" ? "" : "s"} from the CSV.</p>
          {skippedDuplicate && (
            <p className="mt-1 text-xs">
              Skipped {skippedDuplicate} row{skippedDuplicate === "1" ? "" : "s"} already listed.
            </p>
          )}
          {skippedNoPrice && (
            <p className="mt-1 text-xs">
              Skipped {skippedNoPrice} row{skippedNoPrice === "1" ? "" : "s"} with no price.
            </p>
          )}
          {importedWithoutSet && (
            <p className="mt-1 text-xs">
              Imported without a set link (no matching synced set, so no
              auto image or set-page listing): {importedWithoutSet}. Add
              these as sets on the Sets page for full support, or leave
              them as-is — they still show up in the shop.
            </p>
          )}
        </div>
      )}
      {importError && (
        <p className="mt-4 rounded-lg border border-accent-red/40 bg-accent-red/10 p-3 text-sm text-accent-red">
          {importError}
        </p>
      )}
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

      <form
        action={importProductsCsv}
        encType="multipart/form-data"
        className="mt-6 rounded-xl border border-border bg-surface p-4"
      >
        <label className="mb-1 block text-xs font-semibold uppercase text-muted">
          Bulk import from CSV
        </label>
        <p className="mb-3 text-xs text-muted">
          A collection-tracker export with Set, Product Name, Card Number, Rarity,
          Variance, Grade, Card Condition, Quantity, and Market Price columns. Rows
          are matched to a set by name and, when a synced card matches, get its
          artwork automatically. Re-uploading skips rows already listed.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-accent-yellow file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-950"
          />
          <Button type="submit" variant="secondary">
            Import CSV
          </Button>
        </div>
      </form>

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
        <Input name="price" type="number" step="0.01" placeholder="Price ($)" required />
        <Input name="compare_at_price" type="number" step="0.01" placeholder="Compare-at price ($)" />
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
