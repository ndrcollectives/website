"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createSet(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("sets").insert({
    name: String(formData.get("name")),
    code: String(formData.get("code")),
    era: String(formData.get("era")),
    release_date: String(formData.get("release_date")),
    total_cards: Number(formData.get("total_cards") ?? 0),
    logo_url: String(formData.get("logo_url") ?? "") || null,
    banner_url: String(formData.get("banner_url") ?? "") || null,
    is_upcoming: formData.get("is_upcoming") === "on",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/sets");
  revalidatePath("/sets");
  revalidatePath("/");
}

export async function deleteSet(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("sets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/sets");
  revalidatePath("/sets");
}
