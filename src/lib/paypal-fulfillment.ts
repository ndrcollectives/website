import type { createAdminClient } from "@/lib/supabase/admin";
import type { PayPalOrder } from "@/lib/paypal";

// Called from both the post-approval return route and the webhook — a
// captured order can be reported by either path (or both, if the buyer's
// tab closes before the redirect finishes), so this upserts on
// paypal_order_id and only inserts order_items/decrements stock once.
export async function recordPaypalOrder(
  supabase: ReturnType<typeof createAdminClient>,
  order: PayPalOrder,
) {
  const unit = order.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  if (!unit || !capture || capture.status !== "COMPLETED") return null;

  const shippingAddress = unit.shipping?.address
    ? {
        name: unit.shipping.name?.full_name ?? null,
        line1: unit.shipping.address.address_line_1 ?? null,
        line2: unit.shipping.address.address_line_2 ?? null,
        city: unit.shipping.address.admin_area_2 ?? null,
        state: unit.shipping.address.admin_area_1 ?? null,
        postal_code: unit.shipping.address.postal_code ?? null,
        country: unit.shipping.address.country_code ?? null,
      }
    : null;

  const totalCents = Math.round(
    Number(capture.amount?.value ?? unit.amount?.value ?? "0") * 100,
  );

  const { data: dbOrder, error: orderError } = await supabase
    .from("orders")
    .upsert(
      {
        payment_provider: "paypal",
        paypal_order_id: order.id,
        paypal_capture_id: capture.id,
        user_id: unit.custom_id || null,
        status: "paid",
        total_amount_cents: totalCents,
        shipping_address: shippingAddress,
      },
      { onConflict: "paypal_order_id" },
    )
    .select()
    .single();

  if (orderError || !dbOrder) {
    console.error("Failed to upsert PayPal order", orderError);
    return null;
  }

  const items = (unit.items ?? []).filter((i) => i.sku);
  if (items.length === 0) return dbOrder;

  const { count } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("order_id", dbOrder.id);
  if (count && count > 0) return dbOrder;

  const productIds = items.map((i) => i.sku as string);
  const { data: products } = await supabase
    .from("products")
    .select("id, price_cents")
    .in("id", productIds);

  const orderItems = items.map((i) => ({
    order_id: dbOrder.id,
    product_id: i.sku as string,
    quantity: Number(i.quantity ?? "1"),
    unit_price_cents: products?.find((p) => p.id === i.sku)?.price_cents ?? 0,
  }));

  await supabase.from("order_items").insert(orderItems);

  for (const item of orderItems) {
    await supabase.rpc("decrement_inventory", {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    });
  }

  return dbOrder;
}
