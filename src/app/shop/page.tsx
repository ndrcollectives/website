import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { CardTile } from "@/components/card-tile";
import { ShopFilters } from "@/components/shop-filters";
import { getAllSets, getShopEntries } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Search and filter Pokémon TCG singles, booster boxes, ETBs, packs, and graded slabs by set, rarity, condition, and price.",
};

type SearchParams = Record<string, string | undefined>;

const PAGE_SIZE = 25;

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
    // Card number is the most useful default for browsing a set's
    // checklist — "Newest Added" is still available from the sort menu.
    sort: (params.sort as never) ?? "card_number",
  };

  const [entries, sets] = await Promise.all([
    getShopEntries(filters),
    getAllSets(),
  ]);

  const listedCount = entries.filter((e) => e.kind === "product").length;

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
  const pageEntries = entries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function pageHref(page: number) {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === "page" || !value) continue;
      sp.set(key, value);
    }
    if (page > 1) sp.set("page", String(page));
    const qs = sp.toString();
    return qs ? `/shop?${qs}` : "/shop";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Shop</h1>
      <p className="mt-2 text-muted">
        {listedCount} item{listedCount === 1 ? "" : "s"} for sale
        {entries.length > listedCount
          ? ` · ${entries.length - listedCount} more shown, not currently listed`
          : ""}
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <ShopFilters sets={sets} params={params} />

        <div>
          {entries.length === 0 ? (
            <p className="mt-16 text-center text-muted">
              No products match those filters yet.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {pageEntries.map((entry) =>
                  entry.kind === "product" ? (
                    <ProductCard key={entry.id} product={entry.product} />
                  ) : (
                    <CardTile key={entry.id} card={entry.card} set={entry.set} />
                  ),
                )}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  {currentPage > 1 ? (
                    <Link
                      href={pageHref(currentPage - 1)}
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-accent-yellow/60"
                    >
                      <ChevronLeft className="h-4 w-4" /> Prev
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted opacity-40">
                      <ChevronLeft className="h-4 w-4" /> Prev
                    </span>
                  )}
                  <span className="text-sm text-muted">
                    Page {currentPage} of {totalPages}
                  </span>
                  {currentPage < totalPages ? (
                    <Link
                      href={pageHref(currentPage + 1)}
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-accent-yellow/60"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted opacity-40">
                      Next <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
