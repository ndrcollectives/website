import { createClient } from "@/lib/supabase/server";
import { isNextControlFlowError } from "@/lib/supabase/errors";
import type { Card, NewsArticle, Product, Set } from "@/lib/types";

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

export async function getUpcomingSets(limit = 6): Promise<Set[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("sets")
      .select("*")
      .eq("is_upcoming", true)
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
      .eq("set_id", setId)
      .order("number", { ascending: true });
    return (data as Card[]) ?? [];
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
        query = query.order("card_number", { ascending: true });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data } = await query;
    return (data as Product[]) ?? [];
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
