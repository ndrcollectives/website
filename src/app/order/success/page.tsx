import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let amountTotal: number | null = null;
  let email: string | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      amountTotal = session.amount_total;
      email = session.customer_details?.email ?? null;
    } catch {
      // Session may be invalid/expired — still show a generic confirmation.
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <ClearCartOnMount />
      <CheckCircle2 className="mx-auto h-14 w-14 text-accent-yellow" />
      <h1 className="mt-4 text-3xl font-extrabold">Order Confirmed!</h1>
      <p className="mt-2 text-muted">
        {email
          ? `A receipt has been sent to ${email}.`
          : "Thanks for your order."}
      </p>
      {amountTotal != null && (
        <p className="mt-4 text-2xl font-bold text-accent-yellow">
          {formatPrice(amountTotal)}
        </p>
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
