import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "@/components/countdown-timer";
import { getAllSets } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import type { Set } from "@/lib/types";

export const metadata: Metadata = {
  title: "Set Release Calendar",
  description:
    "Complete chronological Pokémon TCG set release tracker: upcoming, current era, and past eras with countdowns and card counts.",
};

function groupSets(sets: Set[]) {
  const now = Date.now();
  const upcoming = sets.filter((s) => new Date(s.release_date).getTime() > now);
  const past = sets.filter((s) => new Date(s.release_date).getTime() <= now);
  const currentEra = past.filter((s) => s.era === past[0]?.era);
  const pastEras = past.filter((s) => !currentEra.includes(s));
  return { upcoming, currentEra, pastEras };
}

export default async function SetsPage() {
  const sets = await getAllSets();
  const { upcoming, currentEra, pastEras } = groupSets(sets);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Release Calendar</h1>
      <p className="mt-2 text-muted">
        Every Pokémon TCG set, tracked from announcement to release.
      </p>

      <SetSection title="Upcoming" sets={upcoming} showCountdown />
      <SetSection title="Current Era" sets={currentEra} />
      <SetSection title="Past Eras" sets={pastEras} />
    </div>
  );
}

function SetSection({
  title,
  sets,
  showCountdown,
}: {
  title: string;
  sets: Set[];
  showCountdown?: boolean;
}) {
  if (sets.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sets.map((set) => (
          <Link
            key={set.id}
            id={set.code}
            href={`/sets/${set.code}`}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent-yellow/60"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0">
                {set.logo_url ? (
                  <Image
                    src={set.logo_url}
                    alt={set.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-md bg-surface-raised text-xs">
                    {set.code}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold">{set.name}</p>
                <p className="text-xs text-muted">{set.era}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted">
              <span>{formatDate(set.release_date)}</span>
              <Badge>{set.total_cards} cards</Badge>
            </div>

            {showCountdown && <CountdownTimer releaseDate={set.release_date} />}
          </Link>
        ))}
      </div>
    </section>
  );
}
