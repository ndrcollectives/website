import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/paypal";
import { calculateTransactionFeeCents, SHIPPING_FLAT_CENTS } from "@/lib/pricing";
import { validateCartItems, subtotalCentsOf, type CheckoutLineInput } from "@/lib/checkout";

function euros(cents: number) {
  return (cents / 100).toFixed(2);
}

export async function POST(request: Request) {
  try {
    return await handleCreate(request);
  } catch (err) {
    console.error("PayPal checkout error:", err);
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function handleCreate(request: Request) {
  const { items } = (await request.json()) as { items: CheckoutLineInput[] };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const validated = await validateCartItems(supabase, items);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const subtotalCents = subtotalCentsOf(validated.lines);
  const feeCents = calculateTransactionFeeCents(subtotalCents);
  const totalCents = subtotalCents + feeCents + SHIPPING_FLAT_CENTS;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // sku carries the product id and reappears verbatim on the captured
  // order, so the return route can rebuild order_items without needing a
  // separate place to stash cart metadata (PayPal's custom_id is too
  // short to hold a whole cart as JSON).
  const order = await createOrder({
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: "default",
        custom_id: user?.id ?? "",
        amount: {
          currency_code: "EUR",
          value: euros(totalCents),
          breakdown: {
            item_total: { currency_code: "EUR", value: euros(subtotalCents) },
            shipping: { currency_code: "EUR", value: euros(SHIPPING_FLAT_CENTS) },
            handling: { currency_code: "EUR", value: euros(feeCents) },
          },
        },
        items: validated.lines.map((line) => ({
          name: line.title.slice(0, 127),
          sku: line.productId,
          unit_amount: { currency_code: "EUR", value: euros(line.unitAmountCents) },
          quantity: String(line.quantity),
          category: "PHYSICAL_GOODS",
        })),
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          brand_name: "NDR Collectives",
          user_action: "PAY_NOW",
          shipping_preference: "GET_FROM_FILE",
          return_url: `${siteUrl}/api/checkout/paypal/return`,
          cancel_url: `${siteUrl}/cart`,
        },
      },
    },
  });

  const approveUrl = order.links.find(
    (l) => l.rel === "payer-action" || l.rel === "approve",
  )?.href;

  if (!approveUrl) {
    return NextResponse.json({ error: "PayPal did not return an approval link" }, { status: 502 });
  }

  return NextResponse.json({ url: approveUrl });
}
