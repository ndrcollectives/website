import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitForm } from "@/components/admin/confirm-submit-button";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getSuggestedPriceCents } from "@/lib/default-prices";
import { formatPrice } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createBinder, deleteBinder } from "./actions";

const MAX_BINDERS = 5;

export default async function BinderOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in?next=/account/binder");
  const { error } = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const ERROR_MESSAGES: Record<string, string> = {
    limit: dict.binder.errorLimit.replace("{max}", String(MAX_BINDERS)),
    duplicate: dict.binder.errorDuplicate,
    failed: dict.binder.errorFailed,
  };

  const supabase = await createClient();
  const { data: binders } = await supabase
    .from("binders")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: true });

  const binderIds = (binders ?? []).map((b) => b.id);
  const items =
    binderIds.length > 0
      ? (
          await supabase
            .from("binder_items")
            .select("binder_id, variant, quantity, card:cards(rarity)")
            .in("binder_id", binderIds)
        ).data ?? []
      : [];

  type ItemRow = {
    binder_id: string;
    variant: string;
    quantity: number;
    card: { rarity: string | null }[] | { rarity: string | null } | null;
  };
  const rows = items as unknown as ItemRow[];

  const statsByBinder = new Map<string, { count: number; valueCents: number }>();
  let totalCards = 0;
  let totalValueCents = 0;

  for (const row of rows) {
    const card = Array.isArray(row.card) ? row.card[0] : row.card;
    const unitCents = getSuggestedPriceCents(card?.rarity ?? null, row.variant);
    const lineValue = unitCents * row.quantity;
    const entry = statsByBinder.get(row.binder_id) ?? { count: 0, valueCents: 0 };
    entry.count += row.quantity;
    entry.valueCents += lineValue;
    statsByBinder.set(row.binder_id, entry);
    totalCards += row.quantity;
    totalValueCents += lineValue;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link
        href="/account"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {dict.binder.back}
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold">{dict.binder.title}</h1>
      <p className="mt-1 text-muted">{dict.binder.subtitle}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">{dict.binder.statsBinders}</p>
          <p className="mt-1 text-2xl font-bold">{binders?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">{dict.binder.statsCardsTracked}</p>
          <p className="mt-1 text-2xl font-bold">{totalCards}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">{dict.binder.statsUniqueListings}</p>
          <p className="mt-1 text-2xl font-bold">{rows.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">{dict.binder.statsEstimatedValue}</p>
          <p className="mt-1 text-2xl font-bold text-accent-yellow">
            {formatPrice(totalValueCents)}
          </p>
        </div>
      </div>

      {error && ERROR_MESSAGES[error] && (
        <div className="mt-6 rounded-lg border border-accent-red/40 bg-accent-red/10 p-3 text-sm text-accent-red">
          {ERROR_MESSAGES[error]}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(binders ?? []).map((binder) => {
          const stats = statsByBinder.get(binder.id) ?? { count: 0, valueCents: 0 };
          const cardWord = stats.count === 1 ? dict.binder.card : dict.binder.cardPlural;
          return (
            <div
              key={binder.id}
              className="flex flex-col rounded-xl border border-border bg-surface p-4"
            >
              <Link
                href={`/account/binder/${binder.id}`}
                className="flex items-center gap-3 hover:text-accent-yellow"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-yellow/15 text-accent-yellow">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{binder.name}</p>
                  <p className="text-xs text-muted">
                    {stats.count} {cardWord}
                  </p>
                </div>
              </Link>
              <p className="mt-3 text-lg font-bold text-accent-yellow">
                {formatPrice(stats.valueCents)}
              </p>
              <div className="mt-3 flex justify-end">
                <ConfirmSubmitForm
                  action={deleteBinder}
                  variant="destructive"
                  hidden={{ id: binder.id }}
                  confirmMessage={dict.binder.deleteConfirm
                    .replace("{name}", binder.name)
                    .replace("{count}", String(stats.count))}
                >
                  {dict.binder.delete}
                </ConfirmSubmitForm>
              </div>
            </div>
          );
        })}

        {(binders?.length ?? 0) < MAX_BINDERS && (
          <form
            action={createBinder}
            className="flex flex-col justify-center gap-2 rounded-xl border border-dashed border-border p-4"
          >
            <label className="text-sm font-semibold">{dict.binder.newBinder}</label>
            <div className="flex gap-2">
              <Input name="name" placeholder={dict.binder.newBinderPlaceholder} required />
              <Button type="submit" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}
      </div>

      {(binders?.length ?? 0) === 0 && (
        <p className="mt-8 text-center text-muted">{dict.binder.emptyBinders}</p>
      )}
    </div>
  );
}
