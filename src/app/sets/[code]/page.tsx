import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { getCardsForSet, getSetByCode } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const set = await getSetByCode(code);
  if (!set) return {};

  return {
    title: `${set.name} Card List`,
    description: `Every card in the Pokémon TCG ${set.name} set, with official artwork, numbers, and rarities.`,
  };
}

export default async function SetCardListPage({ params }: Props) {
  const { code } = await params;
  const set = await getSetByCode(code);
  if (!set) notFound();

  const cards = await getCardsForSet(set.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/sets" className="hover:text-accent-yellow">
          Sets
        </Link>{" "}
        / <span>{set.name}</span>
      </nav>

      <div className="flex flex-wrap items-center gap-4">
        {set.logo_url && (
          <div className="flex h-16 w-40 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={set.logo_url}
              alt={set.name}
              className="max-h-full w-auto max-w-full"
            />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-extrabold">{set.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {set.era} &middot; {formatDate(set.release_date)} &middot;{" "}
            {set.total_cards} cards
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Link
          href={`/shop?set=${set.id}`}
          className="text-sm font-medium text-accent-blue hover:underline"
        >
          Shop this set &rarr;
        </Link>
      </div>

      {cards.length === 0 ? (
        <p className="mt-16 text-center text-muted">
          Cards haven&apos;t been synced for this set yet. Check back soon.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface p-3"
            >
              <div className="flex aspect-[5/7] items-center justify-center overflow-hidden rounded-lg bg-surface-raised">
                {card.image_large || card.image_small ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.image_large ?? card.image_small ?? undefined}
                    alt={card.name}
                    loading="lazy"
                    className="max-h-full w-auto max-w-full"
                  />
                ) : (
                  <span className="text-xs text-muted">No image</span>
                )}
              </div>
              <p className="mt-2 truncate text-sm font-medium">{card.name}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-muted">#{card.number}</span>
                {card.rarity && (
                  <Badge variant="purple" className="text-[10px]">
                    {card.rarity}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
