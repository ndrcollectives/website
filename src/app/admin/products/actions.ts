"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/paginate";
import { normalizeCardNumber } from "@/lib/card-number";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const title = String(formData.get("title") ?? "");
  const images = String(formData.get("images") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase.from("products").insert({
    title,
    slug: `${slugify(title)}-${Date.now().toString(36)}`,
    description: String(formData.get("description") ?? "") || null,
    product_type: String(formData.get("product_type")),
    set_id: String(formData.get("set_id") ?? "") || null,
    card_number: String(formData.get("card_number") ?? "") || null,
    rarity: String(formData.get("rarity") ?? "") || null,
    condition: String(formData.get("condition") ?? "") || null,
    price_cents: Math.round(Number(formData.get("price")) * 100),
    compare_at_price_cents: formData.get("compare_at_price")
      ? Math.round(Number(formData.get("compare_at_price")) * 100)
      : null,
    inventory_count: Number(formData.get("inventory_count") ?? 0),
    is_preorder: formData.get("is_preorder") === "on",
    images,
    is_featured: formData.get("is_featured") === "on",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function updateProductInventory(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const id = String(formData.get("id"));
  const inventory_count = Number(formData.get("inventory_count"));

  const { error } = await supabase
    .from("products")
    .update({ inventory_count })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

// "Fix Missing Images" only backfills singles matched by set + card
// number against the synced card catalog — sealed product (booster
// boxes, ETBs, packs) has no catalog entry to match against, so it has
// no way to get an image except being set here by hand.
export async function updateProductImages(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const id = String(formData.get("id"));
  const images = String(formData.get("images") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase.from("products").update({ images }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

// Creates a single-card listing straight from a synced catalog card (see
// admin/products/by-set/[setId]) — title/image/rarity come from the card
// record itself, so there's no separate image-fixing step needed. Variant
// (Normal/Reverse Holofoil/etc.) isn't a field on `cards` (that table is
// pure card identity, one row per print), so it's folded into the title
// the same way CSV import used to, keeping each variant a distinct row.
export async function createProductFromCard(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const cardName = String(formData.get("card_name") ?? "");
  const variant = String(formData.get("variant") ?? "Normal");
  const title = variant === "Normal" ? cardName : `${cardName} · ${variant}`;
  const image = String(formData.get("image") ?? "");

  const { error } = await supabase.from("products").insert({
    title,
    slug: `${slugify(title)}-${Date.now().toString(36)}`,
    product_type: "single",
    set_id: String(formData.get("set_id") ?? "") || null,
    card_number: String(formData.get("card_number") ?? "") || null,
    rarity: String(formData.get("rarity") ?? "") || null,
    price_cents: Math.round(Number(formData.get("price")) * 100),
    inventory_count: Number(formData.get("quantity") ?? 0),
    images: image ? [image] : [],
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  const setId = String(formData.get("set_id") ?? "");
  if (setId) revalidatePath(`/admin/products/by-set/${setId}`);
}

// Fixes up products that were listed with no image but do have a set +
// card number that matches a synced card — e.g. CSV imports done before
// the number-format mismatch ("180/217" vs the catalog's bare "180") was
// fixed. Safe to re-run; only touches rows with an empty images array.
export async function backfillProductImages() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: candidates } = await supabase
    .from("products")
    .select("id, set_id, card_number, images")
    .not("set_id", "is", null)
    .not("card_number", "is", null);

  const targets = (candidates ?? []).filter((p) => !p.images || p.images.length === 0);

  if (targets.length === 0) {
    redirect("/admin/products?backfilled=0");
  }

  const setIds = Array.from(new Set(targets.map((p) => p.set_id as string)));
  const cardsData = await fetchAllRows<{
    set_id: string;
    number: string;
    image_large: string | null;
    image_small: string | null;
  }>((from, to) =>
    supabase
      .from("cards")
      .select("set_id, number, image_large, image_small")
      .in("set_id", setIds)
      .range(from, to),
  );

  const cardsPerSet = new Map<string, number>();
  for (const c of cardsData) {
    cardsPerSet.set(c.set_id, (cardsPerSet.get(c.set_id) ?? 0) + 1);
  }
  const cardImages = new Map(
    cardsData
      .filter((c) => c.image_large || c.image_small)
      .map((c) => [`${c.set_id}::${c.number}`, (c.image_large ?? c.image_small) as string]),
  );

  const matched: { id: string; image: string }[] = [];
  const unmatchedNoCardsSetIds = new Set<string>();
  let unmatchedNumberNotFound = 0;

  for (const p of targets) {
    const image = cardImages.get(`${p.set_id}::${normalizeCardNumber(p.card_number as string)}`);
    if (image) {
      matched.push({ id: p.id as string, image });
    } else if (!cardsPerSet.get(p.set_id as string)) {
      unmatchedNoCardsSetIds.add(p.set_id as string);
    } else {
      unmatchedNumberNotFound += 1;
    }
  }

  // Update in bounded-concurrency batches rather than one at a time —
  // each row gets a different image, so this can't be a single bulk query.
  const BATCH_SIZE = 20;
  let updated = 0;
  for (let i = 0; i < matched.length; i += BATCH_SIZE) {
    const batch = matched.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((p) => supabase.from("products").update({ images: [p.image] }).eq("id", p.id)),
    );
    updated += results.filter((r) => !r.error).length;
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");

  const params = new URLSearchParams({ backfilled: String(updated) });
  if (unmatchedNumberNotFound) {
    params.set("noNumberMatch", String(unmatchedNumberNotFound));
  }
  if (unmatchedNoCardsSetIds.size > 0) {
    const { data: unsyncedSets } = await supabase
      .from("sets")
      .select("name")
      .in("id", Array.from(unmatchedNoCardsSetIds));
    params.set(
      "unsyncedSets",
      (unsyncedSets ?? []).map((s) => s.name).join(", "),
    );
  }
  redirect(`/admin/products?${params.toString()}`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

// Deletes a checked set of listings in one query — backs the "Delete
// Selected" bulk action.
export async function deleteProducts(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const ids = String(formData.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0) return;

  const { error } = await supabase.from("products").delete().in("id", ids);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

// Deletes every listing for one set — backs the per-group "Delete All"
// button so clearing out a bad CSV import doesn't take one-by-one clicks.
export async function deleteProductsBySet(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const setId = String(formData.get("set_id") ?? "");
  if (!setId) return;

  const { error } = await supabase.from("products").delete().eq("set_id", setId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
