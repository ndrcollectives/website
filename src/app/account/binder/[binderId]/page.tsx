import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AddBinderItemForm } from "@/components/binder/add-binder-item-form";
import { BinderItemTile } from "@/components/binder/binder-item-tile";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getSuggestedPriceCents } from "@/lib/default-prices";
import { formatPrice } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { BinderItem, Card, Set } from "@/lib/types";

export default async function BinderDetailPage({
  params,
}: {
  params: Promise<{ binderId: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in?next=/account/binder");

  const { binderId } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();

  const { data: binder } = await supabase
    .from("binders")
    .select("*")
    .eq("id", binderId)
    .eq("user_id", profile.id)
    .single();

  if (!binder) notFound();

  const { data: itemRows } = await supabase
    .from("binder_items")
    .select("*, card:cards(*, set:sets(*))")
    .eq("binder_id", binderId)
    .order("added_at", { ascending: false });

  const items = (itemRows ?? []) as unknown as (BinderItem & {
    card: (Card & { set: Set | null }) | null;
  })[];

  const totalCards = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalValueCents = items.reduce(
    (sum, i) => sum + getSuggestedPriceCents(i.card?.rarity ?? null, i.variant) * i.quantity,
    0,
  );
  const listingWord = items.length === 1 ? dict.binder.listing : dict.binder.listingPlural;
  const cardWord = totalCards === 1 ? dict.binder.card : dict.binder.cardPlural;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link
        href="/account/binder"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {dict.binder.backToBinders}
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">{binder.name}</h1>
          <p className="mt-1 text-muted">
            {items.length} {listingWord} · {totalCards} {cardWord}
          </p>
        </div>
        <p className="text-2xl font-bold text-accent-yellow">{formatPrice(totalValueCents)}</p>
      </div>

      <div className="mt-6">
        <AddBinderItemForm binderId={binder.id} />
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-center text-muted">{dict.binder.emptyItems}</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <BinderItemTile key={item.id} item={item} dict={dict} />
          ))}
        </div>
      )}
    </div>
  );
}
