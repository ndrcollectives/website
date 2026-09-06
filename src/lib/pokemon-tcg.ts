// Source for keeping the `sets`/`cards` tables in sync without hand-entry.
//
// This used to call the api.pokemontcg.io REST API directly, but that
// service has become unreliable (extended outages returning raw gateway
// error pages, not just rate-limit 429s). Its maintainers publish the same
// underlying dataset as static JSON files in a public GitHub repo —
// https://github.com/PokemonTCG/pokemon-tcg-data — which we fetch from
// GitHub's CDN instead. Same fields, same image URLs, no API server to go
// down, and no API key needed.
const DATA_BASE = "https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master";

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

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// GitHub's raw content CDN is far more reliable than the old API, but still
// retry a couple of times on transient blips before giving up.
async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok || !RETRYABLE_STATUSES.has(res.status) || attempt === attempts) {
        return res;
      }
      lastError = new Error(`${res.status} ${res.statusText}`);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) throw error;
    }
    await sleep(1000 * attempt);
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function describeError(res: Response, url: string): Promise<string> {
  const body = await res.text().catch(() => "");
  const snippet = body.trim().slice(0, 200);
  return snippet
    ? `Failed to fetch ${url}: ${res.status} ${res.statusText} — ${snippet}`
    : `Failed to fetch ${url}: ${res.status} ${res.statusText}`;
}

function toIsoDate(apiDate: string): string {
  return apiDate.replaceAll("/", "-");
}

export async function fetchAllSets(): Promise<SyncedSet[]> {
  const url = `${DATA_BASE}/sets/en.json`;
  const res = await fetchWithRetry(url);
  if (!res.ok) throw new Error(await describeError(res, url));

  const sets = (await res.json()) as ApiSet[];
  const today = new Date();

  return sets.map((set) => {
    const releaseDate = toIsoDate(set.releaseDate);
    return {
      name: set.name,
      code: set.id,
      era: set.series,
      release_date: releaseDate,
      total_cards: set.total,
      logo_url: set.images?.logo ?? null,
      is_upcoming: new Date(releaseDate) > today,
    };
  });
}

type ApiCard = {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  supertype?: string;
  artist?: string;
  images?: { small?: string; large?: string };
};

export type SyncedCard = {
  api_id: string;
  name: string;
  number: string;
  rarity: string | null;
  supertype: string | null;
  image_small: string | null;
  image_large: string | null;
  artist: string | null;
};

// setCode is the dataset's own set id (what we store as `sets.code` — see
// fetchAllSets above), e.g. "sv8" or "swsh1".
export async function fetchCardsForSet(setCode: string): Promise<SyncedCard[]> {
  const url = `${DATA_BASE}/cards/en/${encodeURIComponent(setCode)}.json`;
  const res = await fetchWithRetry(url);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        `No card data found for set "${setCode}" — it may not be in the pokemon-tcg-data repo yet.`,
      );
    }
    throw new Error(await describeError(res, url));
  }

  const cards = (await res.json()) as ApiCard[];

  return cards.map((card) => ({
    api_id: card.id,
    name: card.name,
    number: card.number,
    rarity: card.rarity ?? null,
    supertype: card.supertype ?? null,
    image_small: card.images?.small ?? null,
    image_large: card.images?.large ?? null,
    artist: card.artist ?? null,
  }));
}
