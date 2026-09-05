import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ count: productCount }, { count: setCount }, { count: articleCount }, { data: orders }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("sets").select("*", { count: "exact", head: true }),
      supabase.from("news_articles").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total_amount_cents, status"),
    ]);

  const revenue =
    orders
      ?.filter((o) => o.status === "paid" || o.status === "shipped")
      .reduce((sum, o) => sum + o.total_amount_cents, 0) ?? 0;

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
      </div>
    </div>
  );
}
