"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
