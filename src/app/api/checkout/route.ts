import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

type CheckoutLineInput = { productId: string; quantity: number };

export async function POST(request: Request) {
  try {
    return await handleCheckout(request);
  } catch (err) {
    // Without this, an unhandled error (e.g. Stripe rejecting the request —
    // amounts below its ~€0.50 minimum charge, a missing/invalid API key)
    // crashes the route and the client gets a non-JSON response, which
    // surfaces client-side as a confusing "Unexpected end of JSON input"
    // instead of the actual problem.
    const message =
      err instanceof Stripe.errors.StripeError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Checkout failed";
    console.error("Checkout error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function handleCheckout(request: Request) {
  const { items } = (await request.json()) as { items: CheckoutLineInput[] };

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const productIds = items.map((i) => i.productId);
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  if (error || !products || products.length === 0) {
    return NextResponse.json({ error: "Unable to load products" }, { status: 400 });
  }

  // Never trust client-submitted prices — always re-price and re-validate
  // stock against the database before creating the Stripe session.
  const lineItems: Array<{
    price_data: {
      currency: string;
      unit_amount: number;
      product_data: { name: string; images?: string[]; metadata: Record<string, string> };
    };
    quantity: number;
  }> = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Product ${item.productId} no longer exists` },
        { status: 400 },
      );
    }
    if (!product.is_preorder && product.inventory_count < item.quantity) {
      return NextResponse.json(
        { error: `Not enough stock for "${product.title}"` },
        { status: 400 },
      );
    }
    lineItems.push({
      price_data: {
        currency: "eur",
        unit_amount: product.price_cents,
        product_data: {
          name: product.title,
          images: product.images?.[0] ? [product.images[0]] : undefined,
          metadata: { product_id: product.id },
        },
      },
      quantity: item.quantity,
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${siteUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart`,
    shipping_address_collection: {
      allowed_countries: ["NL", "BE", "DE", "FR", "US", "CA", "GB", "AU"],
    },
    phone_number_collection: { enabled: true },
    customer_email: user?.email ?? undefined,
    metadata: {
      user_id: user?.id ?? "",
      items: JSON.stringify(
        items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      ),
    },
  });

  return NextResponse.json({ url: session.url });
}
