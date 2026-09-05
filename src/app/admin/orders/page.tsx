import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { refundOrder, updateFulfillment } from "./actions";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, profile:profiles(email)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders & Fulfillment</h1>

      <div className="mt-6 space-y-4">
        {orders?.map((order) => (
          <div key={order.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-muted">
                  {order.profile?.email ?? "Guest"} &middot; {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{order.status}</Badge>
                <span className="font-semibold text-accent-yellow">
                  {formatPrice(order.total_amount_cents)}
                </span>
              </div>
            </div>

            <form action={updateFulfillment} className="mt-4 flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={order.id} />
              <div>
                <label className="mb-1 block text-xs text-muted">Status</label>
                <Select name="status" defaultValue={order.status} className="h-9 w-36">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Tracking #</label>
                <Input
                  name="tracking_number"
                  defaultValue={order.tracking_number ?? ""}
                  className="h-9 w-40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Carrier</label>
                <Input
                  name="carrier"
                  defaultValue={order.carrier ?? ""}
                  className="h-9 w-32"
                />
              </div>
              <Button size="sm" type="submit">
                Update
              </Button>
            </form>

            {order.stripe_payment_intent_id && order.status !== "refunded" && (
              <form action={refundOrder} className="mt-2">
                <input type="hidden" name="id" value={order.id} />
                <Button size="sm" variant="destructive" type="submit">
                  Refund via Stripe
                </Button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
