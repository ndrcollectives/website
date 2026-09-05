"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllSets } from "@/lib/pokemon-tcg";

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

export async function syncSetsFromApi() {
  await requireAdmin();
  const supabase = createAdminClient();

  let synced = 0;
  try {
    const sets = await fetchAllSets();

    // Preserve any admin-entered banner_url — the public API doesn't have
    // a banner asset, only per-set logo/symbol artwork.
    const { error } = await supabase.from("sets").upsert(
      sets.map((s) => ({
        name: s.name,
        code: s.code,
        era: s.era,
        release_date: s.release_date,
        total_cards: s.total_cards,
        logo_url: s.logo_url,
        is_upcoming: s.is_upcoming,
      })),
      { onConflict: "code", ignoreDuplicates: false },
    );

    if (error) throw new Error(error.message);
    synced = sets.length;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    redirect(`/admin/sets?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/sets");
  revalidatePath("/sets");
  revalidatePath("/");
  redirect(`/admin/sets?synced=${synced}`);
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
