import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe requires the raw request body to verify the webhook signature, so
// this route must not run through any body-parsing middleware.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(supabase, session);
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("stripe_payment_intent_id", intent.id);
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      if (typeof charge.payment_intent === "string") {
        await supabase
          .from("orders")
          .update({ status: "refunded" })
          .eq("stripe_payment_intent_id", charge.payment_intent);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session,
) {
  const metadataItems = session.metadata?.items
    ? (JSON.parse(session.metadata.items) as { product_id: string; quantity: number }[])
    : [];
  const userId = session.metadata?.user_id || null;

  const shippingAddress = session.customer_details?.address
    ? {
        name: session.customer_details.name,
        ...session.customer_details.address,
      }
    : null;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .upsert(
      {
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        user_id: userId,
        status: "paid",
        total_amount_cents: session.amount_total ?? 0,
        shipping_address: shippingAddress,
      },
      { onConflict: "stripe_session_id" },
    )
    .select()
    .single();

  if (orderError || !order) {
    console.error("Failed to upsert order", orderError);
    return;
  }

  if (metadataItems.length === 0) return;

  const { data: products } = await supabase
    .from("products")
    .select("id, price_cents")
    .in(
      "id",
      metadataItems.map((i) => i.product_id),
    );

  const orderItems = metadataItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price_cents:
      products?.find((p) => p.id === item.product_id)?.price_cents ?? 0,
  }));

  await supabase.from("order_items").insert(orderItems);

  for (const item of metadataItems) {
    await supabase.rpc("decrement_inventory", {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    });
  }
}
