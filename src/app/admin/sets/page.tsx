import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { createSet, deleteSet } from "./actions";

export default async function AdminSetsPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: sets } = await supabase
    .from("sets")
    .select("*")
    .order("release_date", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">Set Manager</h1>

      <form
        action={createSet}
        className="mt-6 grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2"
      >
        <Input name="name" placeholder="Set name (e.g. 151)" required />
        <Input name="code" placeholder="Set code (unique)" required />
        <Input name="era" placeholder="Era (e.g. Scarlet & Violet)" required />
        <Input name="release_date" type="date" required />
        <Input name="total_cards" type="number" placeholder="Total cards" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_upcoming" /> Upcoming release
        </label>
        <Input name="logo_url" placeholder="Logo URL" className="sm:col-span-2" />
        <Input name="banner_url" placeholder="Banner URL" className="sm:col-span-2" />
        <Button type="submit" className="sm:col-span-2">
          Add Set
        </Button>
      </form>

      <div className="mt-8 space-y-3">
        {sets?.map((set) => (
          <div
            key={set.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
          >
            <div>
              <p className="font-semibold">{set.name}</p>
              <p className="text-sm text-muted">
                {set.era} &middot; {formatDate(set.release_date)} &middot; {set.total_cards} cards
              </p>
            </div>
            <form action={deleteSet}>
              <input type="hidden" name="id" value={set.id} />
              <Button size="sm" variant="destructive" type="submit">
                Delete
              </Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
