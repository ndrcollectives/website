import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getAllSets, getProducts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Search and filter Pokémon TCG singles, booster boxes, ETBs, packs, and graded slabs by set, rarity, condition, and price.",
};

const PRODUCT_TYPES = [
  { value: "single", label: "Single" },
  { value: "sealed_box", label: "Booster Box" },
  { value: "etb", label: "Elite Trainer Box" },
  { value: "pack", label: "Booster Pack" },
  { value: "graded_slab", label: "Graded Card / Slab" },
];

const RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Holo Rare",
  "Ultra Rare",
  "Illustration Rare",
  "Special Illustration Rare",
  "Secret Illustration Rare",
  "Hyper Rare",
];

const CONDITIONS = ["M", "NM", "LP", "MP", "HP", "DMG"];

type SearchParams = Record<string, string | undefined>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const filters = {
    setId: params.set,
    productType: params.product_type,
    rarity: params.rarity,
    condition: params.condition,
    minPrice: params.min_price ? Number(params.min_price) * 100 : undefined,
    maxPrice: params.max_price ? Number(params.max_price) * 100 : undefined,
    search: params.search,
    sort: (params.sort as never) ?? undefined,
  };

  const [products, sets] = await Promise.all([
    getProducts(filters),
    getAllSets(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Shop</h1>
      <p className="mt-2 text-muted">
        {products.length} item{products.length === 1 ? "" : "s"} found
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <form className="h-fit space-y-5 rounded-xl border border-border bg-surface p-4" method="get">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted">
              Search
            </label>
            <Input name="search" defaultValue={params.search} placeholder="Charizard 004/102" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted">
              Set / Expansion
            </label>
            <Select name="set" defaultValue={params.set ?? ""}>
              <option value="">All sets</option>
              {sets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted">
              Card Type
            </label>
            <Select name="product_type" defaultValue={params.product_type ?? ""}>
              <option value="">All types</option>
              {PRODUCT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted">
              Rarity
            </label>
            <Select name="rarity" defaultValue={params.rarity ?? ""}>
              <option value="">All rarities</option>
              {RARITIES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted">
              Condition
            </label>
            <Select name="condition" defaultValue={params.condition ?? ""}>
              <option value="">Any condition</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted">
              Price ($)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                name="min_price"
                min={0}
                defaultValue={params.min_price}
                placeholder="Min"
              />
              <Input
                type="number"
                name="max_price"
                min={0}
                defaultValue={params.max_price}
                placeholder="Max"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted">
              Sort By
            </label>
            <Select name="sort" defaultValue={params.sort ?? "newest"}>
              <option value="newest">Newest Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="card_number">Set Number</option>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Apply Filters
          </Button>
        </form>

        <div>
          {products.length === 0 ? (
            <p className="mt-16 text-center text-muted">
              No products match those filters yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
