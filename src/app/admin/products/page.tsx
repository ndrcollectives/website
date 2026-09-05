import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { createProduct, deleteProduct, updateProductInventory } from "./actions";

export default async function AdminProductsPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ data: products }, { data: sets }] = await Promise.all([
    supabase.from("products").select("*, set:sets(name)").order("created_at", { ascending: false }),
    supabase.from("sets").select("id, name").order("name"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Product Manager</h1>

      <form
        action={createProduct}
        className="mt-6 grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2"
      >
        <Input name="title" placeholder="Title" required className="sm:col-span-2" />
        <Select name="product_type" required defaultValue="single">
          <option value="single">Single</option>
          <option value="sealed_box">Booster Box</option>
          <option value="etb">Elite Trainer Box</option>
          <option value="pack">Booster Pack</option>
          <option value="graded_slab">Graded Slab</option>
        </Select>
        <Select name="set_id" defaultValue="">
          <option value="">No set</option>
          {sets?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Input name="card_number" placeholder="Card # (e.g. 004/102)" />
        <Input name="rarity" placeholder="Rarity" />
        <Input name="condition" placeholder="Condition (NM, LP, ...)" />
        <Input name="price" type="number" step="0.01" placeholder="Price ($)" required />
        <Input name="compare_at_price" type="number" step="0.01" placeholder="Compare-at price ($)" />
        <Input name="inventory_count" type="number" placeholder="Inventory count" />
        <Input
          name="images"
          placeholder="Image URLs, comma separated"
          className="sm:col-span-2"
        />
        <Input name="description" placeholder="Description" className="sm:col-span-2" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_preorder" /> Pre-order
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" /> Featured
        </label>
        <Button type="submit" className="sm:col-span-2">
          Add Product
        </Button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-raised text-left text-muted">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Set</th>
              <th className="p-3">Price</th>
              <th className="p-3">Inventory</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">{p.title}</td>
                <td className="p-3 text-muted">{p.set?.name ?? "—"}</td>
                <td className="p-3">{formatPrice(p.price_cents)}</td>
                <td className="p-3">
                  <form action={updateProductInventory} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={p.id} />
                    <Input
                      name="inventory_count"
                      type="number"
                      defaultValue={p.inventory_count}
                      className="h-8 w-20"
                    />
                    <Button size="sm" variant="secondary" type="submit">
                      Save
                    </Button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <Button size="sm" variant="destructive" type="submit">
                      Delete
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
