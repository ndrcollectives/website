"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function updateFulfillment(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const tracking_number = String(formData.get("tracking_number") ?? "") || null;
  const carrier = String(formData.get("carrier") ?? "") || null;

  const { error } = await supabase
    .from("orders")
    .update({ status, tracking_number, carrier })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
}

export async function refundOrder(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));

  const { data: order } = await supabase
    .from("orders")
    .select("stripe_payment_intent_id")
    .eq("id", id)
    .single();

  if (order?.stripe_payment_intent_id) {
    await stripe.refunds.create({ payment_intent: order.stripe_payment_intent_id });
  }

  const { error } = await supabase.from("orders").update({ status: "refunded" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
}
