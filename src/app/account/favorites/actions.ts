"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ToggleResult = { ok: true; favorited: boolean } | { ok: false; reason: "unauthenticated" };

export async function toggleFavorite(productId: string): Promise<ToggleResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
  } else {
    await supabase.from("favorites").insert({ user_id: user.id, product_id: productId });
  }

  revalidatePath("/shop");
  revalidatePath("/account/favorites");

  return { ok: true, favorited: !existing };
}
