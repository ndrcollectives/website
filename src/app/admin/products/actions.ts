"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildProductInserts, parseProductCsv, type ImportSummary } from "@/lib/product-import";
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

// Imports a collection-tracker CSV export (see product-import.ts for the
// expected columns) as product listings. Matches each row's "Set" to a
// synced set by name and, when a matching card was synced, uses its
// artwork as the listing image automatically.
export async function importProductsCsv(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/products?importError=${encodeURIComponent("Choose a CSV file first")}`);
  }

  let summary: ImportSummary;
  try {
    const text = await file.text();
    const rows = parseProductCsv(text);

    const setNames = Array.from(new Set(rows.map((r) => r.setName).filter(Boolean)));
    const { data: setsData } = setNames.length
      ? await supabase.from("sets").select("id, name").in("name", setNames)
      : { data: [] };
    const setNameToId = new Map(
      (setsData ?? []).map((s) => [s.name.trim().toLowerCase(), s.id as string]),
    );
    const setIds = Array.from(setNameToId.values());

    const { data: cardsData } = setIds.length
      ? await supabase
          .from("cards")
          .select("set_id, number, image_large, image_small")
          .in("set_id", setIds)
      : { data: [] };
    const cardImages = new Map(
      (cardsData ?? [])
        .filter((c) => c.image_large || c.image_small)
        .map((c) => [`${c.set_id}::${c.number}`, (c.image_large ?? c.image_small) as string]),
    );

    const { data: existingData } = setIds.length
      ? await supabase.from("products").select("set_id, card_number, condition, title").in("set_id", setIds)
      : { data: [] };
    const existingKeys = new Set(
      (existingData ?? []).map((p) => `${p.set_id}::${p.card_number}::${p.condition}::${p.title}`),
    );

    const { inserts, summary: builtSummary } = buildProductInserts(
      rows,
      setNameToId,
      cardImages,
      existingKeys,
    );
    summary = builtSummary;

    if (inserts.length > 0) {
      const { error } = await supabase.from("products").insert(inserts);
      if (error) throw new Error(error.message);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "CSV import failed";
    redirect(`/admin/products?importError=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");

  const params = new URLSearchParams({ imported: String(summary.inserted) });
  if (summary.skippedDuplicate) params.set("skippedDuplicate", String(summary.skippedDuplicate));
  if (summary.skippedNoPrice) params.set("skippedNoPrice", String(summary.skippedNoPrice));
  if (summary.skippedNoSet.length) params.set("skippedNoSet", summary.skippedNoSet.join(", "));
  redirect(`/admin/products?${params.toString()}`);
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
  const { data: cardsData } = await supabase
    .from("cards")
    .select("set_id, number, image_large, image_small")
    .in("set_id", setIds);

  const cardsPerSet = new Map<string, number>();
  for (const c of cardsData ?? []) {
    cardsPerSet.set(c.set_id, (cardsPerSet.get(c.set_id) ?? 0) + 1);
  }
  const cardImages = new Map(
    (cardsData ?? [])
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
