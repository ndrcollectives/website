import { createClient } from "@/lib/supabase/server";
import { isNextControlFlowError } from "@/lib/supabase/errors";
import { normalizeCardNumber } from "@/lib/card-number";
import type { Card, NewsArticle, Product, Set, ShopEntry } from "@/lib/types";

// Public read paths (homepage, shop, news) must never 500 the storefront
// just because Supabase isn't configured yet or a query fails — they
// degrade to empty results instead, and the pages already render sensible
// empty states for that case.
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    console.error("Supabase query failed:", error);
    return fallback;
  }
}

// Filters by the actual release date rather than the stored `is_upcoming`
// flag — that flag is only computed once, at sync or manual-entry time,
// and never revisited, so a set synced months ago as "upcoming" would
// stay flagged that way forever after it releases.
export async function getUpcomingSets(limit = 6): Promise<Set[]> {
  return safe(async () => {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("sets")
      .select("*")
      .gt("release_date", today)
      .order("release_date", { ascending: true })
      .limit(limit);
    return (data as Set[]) ?? [];
  }, []);
}

export async function getAllSets(): Promise<Set[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("sets")
      .select("*")
      .order("release_date", { ascending: false });
    return (data as Set[]) ?? [];
  }, []);
}

export async function getSetByCode(code: string): Promise<Set | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("sets")
      .select("*")
      .eq("code", code)
      .single();
    return data as Set | null;
  }, null);
}

export async function getCardsForSet(setId: string): Promise<Card[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cards")
      .select("*")
      .eq("set_id", setId);
    const cards = (data as Card[]) ?? [];
    // `number` is text (e.g. "4", "004/102", "TG01"), so a plain DB text
    // sort puts "10" before "2" — sort numerically here instead.
    return cards.sort((a, b) =>
      a.number.localeCompare(b.number, undefined, { numeric: true }),
    );
  }, []);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, set:sets(*)")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data as Product[]) ?? [];
  }, []);
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Bulk CSV imports insert a card's variants (e.g. "Absol" and
// "Absol · Reverse Holofoil") back-to-back with near-identical
// timestamps, so a plain "most recent" query clumps the same Pokémon —
// and often the same rarity — together. Strip the variant suffix to
// compare on the base card name.
function baseProductName(title: string): string {
  return title.split(" · ")[0].trim();
}

// Powers the homepage's "Just Added" ticker — pulls a larger recent pool,
// shuffles it, and prefers one card per distinct name before filling any
// remaining slots from the rest, so the result reads as a varied mix of
// different cards and rarities rather than one card's run of variants.
export async function getRecentProducts(limit = 10, poolSize = 60): Promise<Product[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, set:sets(*)")
      .order("created_at", { ascending: false })
      .limit(poolSize);
    const pool = shuffle((data as Product[]) ?? []);

    const seenNames = new Set<string>();
    const primary: Product[] = [];
    const rest: Product[] = [];
    for (const product of pool) {
      const name = baseProductName(product.title);
      if (seenNames.has(name)) {
        rest.push(product);
      } else {
        seenNames.add(name);
        primary.push(product);
      }
    }

    return [...primary, ...rest].slice(0, limit);
  }, []);
}

export type ShopFilters = {
  setId?: string;
  productType?: string;
  rarity?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "price_asc" | "price_desc" | "newest" | "card_number";
};

export async function getProducts(filters: ShopFilters = {}): Promise<Product[]> {
  return safe(async () => {
    const supabase = await createClient();
    let query = supabase.from("products").select("*, set:sets(*)");

    if (filters.setId) query = query.eq("set_id", filters.setId);
    if (filters.productType) query = query.eq("product_type", filters.productType);
    if (filters.rarity) query = query.eq("rarity", filters.rarity);
    if (filters.condition) query = query.eq("condition", filters.condition);
    if (filters.minPrice != null) query = query.gte("price_cents", filters.minPrice);
    if (filters.maxPrice != null) query = query.lte("price_cents", filters.maxPrice);
    if (filters.search) query = query.ilike("title", `%${filters.search}%`);

    switch (filters.sort) {
      case "price_asc":
        query = query.order("price_cents", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price_cents", { ascending: false });
        break;
      case "card_number":
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data } = await query;
    const products = (data as Product[]) ?? [];

    // `card_number` is text (e.g. "4", "004/102"), so a plain DB text sort
    // puts "10" before "2" — sort numerically here instead.
    if (filters.sort === "card_number") {
      products.sort((a, b) =>
        (a.card_number ?? "").localeCompare(b.card_number ?? "", undefined, {
          numeric: true,
        }),
      );
    }

    return products;
  }, []);
}

// Cards that have no matching product listing yet don't have a price or
// condition, so merging them in only makes sense when browsing singles
// with no price/condition filter active — those filters describe a real
// listing, not a card that isn't for sale.
function canIncludeUnlistedCards(filters: ShopFilters): boolean {
  return (
    (!filters.productType || filters.productType === "single") &&
    filters.minPrice == null &&
    filters.maxPrice == null &&
    !filters.condition
  );
}

// Merging in literally every synced card with no filter at all would mean
// tens of thousands of rows on one page — cap it, and only do the merge
// once the browse is scoped by a set or a search term.
const UNLISTED_CARDS_LIMIT = 120;

// Powers the shop grid: every listed product, plus (when scoped to a set
// or search, and browsing singles) any card from the synced catalog that
// doesn't have a matching "single" listing — rendered as an
// unavailable/sold-out tile instead of being left out of the catalog.
export async function getShopEntries(filters: ShopFilters = {}): Promise<ShopEntry[]> {
  return safe(async () => {
    const products = await getProducts(filters);
    const entries: ShopEntry[] = products.map((p) => ({
      kind: "product" as const,
      id: p.id,
      product: p,
    }));

    if (!canIncludeUnlistedCards(filters) || (!filters.setId && !filters.search)) {
      return entries;
    }

    const supabase = await createClient();
    let cardQuery = supabase
      .from("cards")
      .select("*, set:sets(*)")
      .order("name", { ascending: true })
      .limit(UNLISTED_CARDS_LIMIT);

    if (filters.setId) cardQuery = cardQuery.eq("set_id", filters.setId);
    if (filters.rarity) cardQuery = cardQuery.eq("rarity", filters.rarity);
    if (filters.search) cardQuery = cardQuery.ilike("name", `%${filters.search}%`);

    const { data } = await cardQuery;
    const cards = (data as (Card & { set: Set | null })[]) ?? [];

    // Products store the card number as entered (often "180/217"), while
    // the synced catalog's `number` is bare ("180") — normalize the
    // product side so a listed card isn't also shown as an unavailable
    // placeholder.
    const listedKeys = new Set(
      products
        .filter((p) => p.product_type === "single" && p.set_id && p.card_number)
        .map((p) => `${p.set_id}::${normalizeCardNumber(p.card_number as string)}`),
    );

    for (const card of cards) {
      const key = `${card.set_id}::${card.number}`;
      if (listedKeys.has(key)) continue;
      entries.push({ kind: "card" as const, id: card.id, card, set: card.set ?? null });
    }

    if (filters.sort === "card_number") {
      entries.sort((a, b) => {
        const numA = a.kind === "product" ? (a.product.card_number ?? "") : a.card.number;
        const numB = b.kind === "product" ? (b.product.card_number ?? "") : b.card.number;
        return numA.localeCompare(numB, undefined, { numeric: true });
      });
    }

    return entries;
  }, []);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, set:sets(*)")
      .eq("slug", slug)
      .single();
    return data as Product | null;
  }, null);
}

// The current signed-in user's favorited product ids, for marking hearts
// filled in product grids — empty (not an error) when signed out.
// ReadonlySet, not Set, because `Set` (the Pokémon TCG entity type) is
// already imported into this module's type namespace, shadowing the
// builtin generic — ReadonlySet is a distinct global identifier.
export async function getFavoriteProductIds(): Promise<ReadonlySet<string>> {
  return safe(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new Set<string>();

    const { data } = await supabase
      .from("favorites")
      .select("product_id")
      .eq("user_id", user.id);
    return new Set((data ?? []).map((f) => f.product_id as string));
  }, new Set<string>());
}

export async function getFavoriteProducts(userId: string): Promise<Product[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("favorites")
      .select("product:products(*, set:sets(*))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return ((data ?? []) as unknown as { product: Product | null }[])
      .map((f) => f.product)
      .filter((p): p is Product => p !== null);
  }, []);
}

export async function getPublishedArticles(
  category?: string,
  limit = 20,
): Promise<NewsArticle[]> {
  return safe(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("news_articles")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (category) query = query.eq("category", category);

    const { data } = await query;
    return (data as NewsArticle[]) ?? [];
  }, []);
}

export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("news_articles")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();
    return data as NewsArticle | null;
  }, null);
}
