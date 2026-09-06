"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllSets, fetchCardsForSet } from "@/lib/pokemon-tcg";

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

async function syncCardsInternal(setId: string, setCode: string): Promise<number> {
  const supabase = createAdminClient();
  const cards = await fetchCardsForSet(setCode);

  if (cards.length > 0) {
    const { error } = await supabase.from("cards").upsert(
      cards.map((c) => ({
        set_id: setId,
        api_id: c.api_id,
        name: c.name,
        number: c.number,
        rarity: c.rarity,
        supertype: c.supertype,
        image_small: c.image_small,
        image_large: c.image_large,
        artist: c.artist,
      })),
      { onConflict: "api_id", ignoreDuplicates: false },
    );

    if (error) throw new Error(error.message);
  }

  return cards.length;
}

export async function syncCardsForSet(formData: FormData) {
  await requireAdmin();

  const setId = String(formData.get("set_id"));
  const setCode = String(formData.get("set_code"));

  let synced = 0;
  try {
    synced = await syncCardsInternal(setId, setCode);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    redirect(`/admin/sets?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/sets");
  revalidatePath(`/sets/${setCode}`);
  redirect(`/admin/sets?cardsSynced=${synced}`);
}

// Same card sync as above, but returns a result instead of redirecting —
// used by BulkSyncCardsButton to call this once per set in a client-side
// loop without navigating away after every single set.
export async function syncCardsForSetSilent(
  setId: string,
  setCode: string,
): Promise<{ synced: number } | { error: string }> {
  await requireAdmin();

  try {
    const synced = await syncCardsInternal(setId, setCode);
    return { synced };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Sync failed" };
  }
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
