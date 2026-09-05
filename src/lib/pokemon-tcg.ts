// Client for the community-run Pokémon TCG API (https://pokemontcg.io),
// used to keep the `sets` table's official data (release dates, card
// counts, artwork) in sync without hand-entry. It only covers sets that
// have actually been printed/announced with a fixed release date — sets
// still under wraps stay admin-entered until the API picks them up.

const API_BASE = "https://api.pokemontcg.io/v2";

type ApiSet = {
  id: string;
  name: string;
  series: string;
  releaseDate: string; // "YYYY/MM/DD"
  total: number;
  images: { symbol: string; logo: string };
};

export type SyncedSet = {
  name: string;
  code: string;
  era: string;
  release_date: string; // "YYYY-MM-DD"
  total_cards: number;
  logo_url: string | null;
  is_upcoming: boolean;
};

function apiHeaders(): HeadersInit {
  const apiKey = process.env.POKEMON_TCG_API_KEY;
  return apiKey ? { "X-Api-Key": apiKey } : {};
}

function toIsoDate(apiDate: string): string {
  return apiDate.replaceAll("/", "-");
}

export async function fetchAllSets(): Promise<SyncedSet[]> {
  const results: SyncedSet[] = [];
  let page = 1;
  const pageSize = 250;

  for (;;) {
    const res = await fetch(
      `${API_BASE}/sets?page=${page}&pageSize=${pageSize}&orderBy=releaseDate`,
      { headers: apiHeaders(), cache: "no-store" },
    );

    if (!res.ok) {
      throw new Error(`Pokémon TCG API request failed: ${res.status} ${res.statusText}`);
    }

    const body = (await res.json()) as { data: ApiSet[] };
    const today = new Date();

    for (const set of body.data) {
      const releaseDate = toIsoDate(set.releaseDate);
      results.push({
        name: set.name,
        code: set.id,
        era: set.series,
        release_date: releaseDate,
        total_cards: set.total,
        logo_url: set.images?.logo ?? null,
        is_upcoming: new Date(releaseDate) > today,
      });
    }

    if (body.data.length < pageSize) break;
    page += 1;
  }

  return results;
}
