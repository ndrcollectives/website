import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/price-tag";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";

type OrderLine = {
  title: string;
  quantity: number;
  amountCents: number;
  image: string | null;
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; paypal_order_id?: string }>;
}) {
  const { session_id, paypal_order_id } = await searchParams;

  let amountTotal: number | null = null;
  let email: string | null = null;
  let orderNumber: string | null = null;
  let lines: OrderLine[] = [];

  if (session_id) {
    try {
      // Expanding line_items (and each line's underlying product) reads
      // straight off the just-created Stripe session — no DB round trip,
      // so there's no race with the webhook that records the order.
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["line_items", "line_items.data.price.product"],
      });
      amountTotal = session.amount_total;
      email = session.customer_details?.email ?? null;
      orderNumber = session.id.replace(/^cs_(test_|live_)?/, "").slice(0, 8);
      lines = (session.line_items?.data ?? [])
        .filter((item) => item.description !== "Transaction fee")
        .map((item) => {
          const product =
            typeof item.price?.product === "object" && item.price.product !== null
              ? item.price.product
              : null;
          const image =
            product && "images" in product ? (product.images?.[0] ?? null) : null;
          return {
            title: item.description ?? "Item",
            quantity: item.quantity ?? 1,
            amountCents: item.amount_total,
            image,
          };
        });
    } catch {
      // Session may be invalid/expired — still show a generic confirmation.
    }
  } else if (paypal_order_id) {
    // The return route already captured and recorded the order by the
    // time the buyer lands here — read it back from our own DB rather
    // than calling PayPal again.
    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id, total_amount_cents")
      .eq("paypal_order_id", paypal_order_id)
      .single();
    amountTotal = order?.total_amount_cents ?? null;
    orderNumber = order?.id.slice(0, 8) ?? null;

    if (order) {
      const { data: items } = await supabase
        .from("order_items")
        .select("quantity, unit_price_cents, product:products(title, images)")
        .eq("order_id", order.id);
      const rows = (items ?? []) as unknown as {
        quantity: number;
        unit_price_cents: number;
        product: { title: string; images: string[] | null } | null;
      }[];
      lines = rows.map((item) => ({
        title: item.product?.title ?? "Item",
        quantity: item.quantity,
        amountCents: item.unit_price_cents * item.quantity,
        image: item.product?.images?.[0] ?? null,
      }));
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:py-24">
      <ClearCartOnMount />

      <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent-yellow/15">
        <CheckCircle2 className="h-11 w-11 text-accent-yellow" />
        <PartyPopper className="absolute -right-1 -top-1 h-7 w-7 rotate-12 text-accent-purple" />
      </div>

      <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">
        Thanks for shopping with NDR Collectives!
      </h1>
      <p className="mt-2 text-muted">
        {email
          ? `Your order is confirmed — a receipt has been sent to ${email}.`
          : "Your order is confirmed."}
      </p>
      {orderNumber && (
        <p className="mt-1 text-sm text-muted">
          Order <span className="font-mono">#{orderNumber}</span>
        </p>
      )}

      {lines.length > 0 && (
        <div className="mt-8 space-y-3 rounded-xl border border-border bg-surface p-4 text-left">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-md bg-surface-raised">
                {line.image ? (
                  <Image src={line.image} alt={line.title} fill className="object-contain p-1" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-muted">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">{line.title}</p>
                <p className="text-xs text-muted">Qty {line.quantity}</p>
              </div>
              <PriceTag cents={line.amountCents} mainClassName="text-sm font-semibold" />
            </div>
          ))}
        </div>
      )}

      {amountTotal != null && (
        <p className="mt-6 text-2xl font-bold text-accent-yellow">{formatPrice(amountTotal)}</p>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/account/orders">
          <Button size="lg">View My Orders</Button>
        </Link>
        <Link href="/shop">
          <Button size="lg" variant="secondary">
            Keep Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
