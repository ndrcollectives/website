import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { fetchAllRows } from "@/lib/supabase/paginate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [
    { count: productCount },
    { count: setCount },
    { count: articleCount },
    { data: orders },
    inventoryRows,
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("sets").select("*", { count: "exact", head: true }),
    supabase.from("news_articles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total_amount_cents, status"),
    fetchAllRows<{ price_cents: number; inventory_count: number }>((from, to) =>
      supabase.from("products").select("price_cents, inventory_count").range(from, to),
    ),
  ]);

  const revenue =
    orders
      ?.filter((o) => o.status === "paid" || o.status === "shipped")
      .reduce((sum, o) => sum + o.total_amount_cents, 0) ?? 0;

  // Total retail value of current stock (price x quantity on hand) — not
  // revenue, which is money already collected from paid/shipped orders.
  const shopValue = inventoryRows.reduce(
    (sum, p) => sum + p.price_cents * p.inventory_count,
    0,
  );

  // Mean listing price across every product — not weighted by quantity,
  // so a card you have 50 of counts the same as a card you have 1 of.
  const avgPrice =
    inventoryRows.length > 0
      ? inventoryRows.reduce((sum, p) => sum + p.price_cents, 0) / inventoryRows.length
      : 0;

  const stats = [
    { label: "Products", value: productCount ?? 0 },
    { label: "Sets Tracked", value: setCount ?? 0 },
    { label: "Articles", value: articleCount ?? 0 },
    { label: "Total Orders", value: orders?.length ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-muted">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{stat.value}</CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-accent-yellow">
            {formatPrice(revenue)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted">
              Total Shop Value
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-accent-yellow">
            {formatPrice(shopValue)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted">
              Avg Price / Card
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-accent-yellow">
            {formatPrice(Math.round(avgPrice))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
