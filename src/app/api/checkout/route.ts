import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { calculateTransactionFeeCents, SHIPPING_FLAT_CENTS } from "@/lib/pricing";
import { validateCartItems, subtotalCentsOf, type CheckoutLineInput } from "@/lib/checkout";

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const validated = await validateCartItems(supabase, items);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const lineItems: Array<{
    price_data: {
      currency: string;
      unit_amount: number;
      product_data: { name: string; images?: string[]; metadata: Record<string, string> };
    };
    quantity: number;
  }> = validated.lines.map((line) => ({
    price_data: {
      currency: "eur",
      unit_amount: line.unitAmountCents,
      product_data: {
        name: line.title,
        images: line.image ? [line.image] : undefined,
        metadata: { product_id: line.productId },
      },
    },
    quantity: line.quantity,
  }));

  // Transaction fee covers the payment provider's own per-charge cost and
  // is computed off the product subtotal only — shipping and the fee
  // itself aren't included, matching how the real fee is assessed.
  const subtotalCents = subtotalCentsOf(validated.lines);
  lineItems.push({
    price_data: {
      currency: "eur",
      unit_amount: calculateTransactionFeeCents(subtotalCents),
      product_data: { name: "Transaction fee", metadata: {} },
    },
    quantity: 1,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${siteUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart`,
    shipping_address_collection: {
      allowed_countries: ["NL", "BE", "DE", "FR", "US", "CA", "GB", "AU"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: SHIPPING_FLAT_CENTS, currency: "eur" },
          display_name: "Shipping",
        },
      },
    ],
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
