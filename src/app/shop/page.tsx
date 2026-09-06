import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { ShopFilters } from "@/components/shop-filters";
import { getAllSets, getProducts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Search and filter Pokémon TCG singles, booster boxes, ETBs, packs, and graded slabs by set, rarity, condition, and price.",
};

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
        <ShopFilters sets={sets} params={params} />

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
