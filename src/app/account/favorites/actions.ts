"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type FavoriteTarget = { productId: string; cardId?: never } | { cardId: string; productId?: never };
type ToggleResult = { ok: true; favorited: boolean } | { ok: false; reason: "unauthenticated" };

export async function toggleFavorite(target: FavoriteTarget): Promise<ToggleResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  const column = target.productId ? "product_id" : "card_id";
  const value = target.productId ?? target.cardId;

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq(column, value)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
  } else {
    await supabase.from("favorites").insert({ user_id: user.id, [column]: value });
  }

  revalidatePath("/shop");
  revalidatePath("/sets/[code]", "page");
  revalidatePath("/account/favorites");

  return { ok: true, favorited: !existing };
}
