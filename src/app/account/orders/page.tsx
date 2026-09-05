import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

const STATUS_VARIANT: Record<string, "yellow" | "blue" | "red" | "default"> = {
  pending: "default",
  paid: "blue",
  shipped: "yellow",
  cancelled: "red",
  refunded: "red",
};

export default async function OrdersPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in?next=/account/orders");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">Order History</h1>

      {!orders || orders.length === 0 ? (
        <p className="mt-8 text-muted">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {(orders as Order[]).map((order) => (
            <div key={order.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted">{formatDate(order.created_at)}</p>
                </div>
                <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>
                  {order.status}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-semibold">
                  {formatPrice(order.total_amount_cents)}
                </span>
                {order.tracking_number && (
                  <span className="text-sm text-muted">
                    Tracking: {order.tracking_number} ({order.carrier})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Link href="/account" className="mt-6 inline-block text-sm text-accent-blue hover:underline">
        &larr; Back to account
      </Link>
    </div>
  );
}
