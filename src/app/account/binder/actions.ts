"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const MAX_BINDERS_PER_USER = 5;

export async function createBinder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/account/binder");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const { count } = await supabase
    .from("binders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= MAX_BINDERS_PER_USER) {
    redirect(`/account/binder?error=limit`);
  }

  const { error } = await supabase.from("binders").insert({ user_id: user.id, name });
  if (error) {
    // Most likely the unique(user_id, name) constraint — a friendlier
    // message than a raw DB error for a name the user already has.
    redirect(`/account/binder?error=${error.code === "23505" ? "duplicate" : "failed"}`);
  }

  revalidatePath("/account/binder");
  redirect("/account/binder");
}

export async function renameBinder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/account/binder");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  await supabase.from("binders").update({ name }).eq("id", id).eq("user_id", user.id);

  revalidatePath("/account/binder");
  revalidatePath(`/account/binder/${id}`);
}

export async function deleteBinder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/account/binder");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("binders").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/account/binder");
  redirect("/account/binder");
}

// Adding the same card+variant+condition again bumps quantity instead of
// creating a second row (see the unique constraint on binder_items) — a
// binder is "how many of this exact printing do I own", not a running log.
export async function addBinderItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/account/binder");

  const binderId = String(formData.get("binder_id") ?? "");
  const cardId = String(formData.get("card_id") ?? "");
  const variant = String(formData.get("variant") ?? "Normal");
  const condition = String(formData.get("condition") ?? "");
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  if (!binderId || !cardId) return;

  // Ownership check — RLS backs this up, but checking here lets the
  // increment-quantity read below assume the binder is really the
  // caller's own.
  const { data: binder } = await supabase
    .from("binders")
    .select("id")
    .eq("id", binderId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!binder) return;

  const { data: existing } = await supabase
    .from("binder_items")
    .select("id, quantity")
    .eq("binder_id", binderId)
    .eq("card_id", cardId)
    .eq("variant", variant)
    .eq("condition", condition)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("binder_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
  } else {
    await supabase.from("binder_items").insert({
      binder_id: binderId,
      card_id: cardId,
      variant,
      condition,
      quantity,
    });
  }

  revalidatePath(`/account/binder/${binderId}`);
  revalidatePath("/account/binder");
}

export async function updateBinderItemQuantity(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/account/binder");

  const id = String(formData.get("id") ?? "");
  const binderId = String(formData.get("binder_id") ?? "");
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  if (!id) return;

  await supabase.from("binder_items").update({ quantity }).eq("id", id);

  revalidatePath(`/account/binder/${binderId}`);
  revalidatePath("/account/binder");
}

export async function removeBinderItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/account/binder");

  const id = String(formData.get("id") ?? "");
  const binderId = String(formData.get("binder_id") ?? "");
  if (!id) return;

  await supabase.from("binder_items").delete().eq("id", id);

  revalidatePath(`/account/binder/${binderId}`);
  revalidatePath("/account/binder");
}
