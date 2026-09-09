// Card rarity strings come straight from the synced dataset (see
// pokemon-tcg.ts) and aren't a fixed enum — e.g. "Rare Holo", "Double
// Rare", "Special Illustration Rare", "Mega Hyper Rare". Bucket them into
// a small set of tiers, ordered common -> rarest, so the UI can color
// common/uncommon/rare/... visibly differently instead of one flat color.
export type RarityTier =
  | "common"
  | "uncommon"
  | "rare"
  | "rare-holo"
  | "double-rare"
  | "ultra-rare"
  | "illustration-rare"
  | "special-illustration-rare"
  | "secret-rare";

// Checked in order — most specific/rarest pattern first, since e.g.
// "Special Illustration Rare" would otherwise also match plain "rare".
// "Double Rare" (ex-Pokémon holo rares) is split out from "Ultra Rare"
// (full-art trainers/Pokémon, ACE SPEC) since real market data shows
// they trade in very different price bands (~€0.50 vs. ~€7+).
const TIER_PATTERNS: [RarityTier, RegExp][] = [
  ["secret-rare", /secret|rainbow|hyper|gold|shiny/i],
  ["special-illustration-rare", /special illustration/i],
  ["illustration-rare", /illustration/i],
  ["ultra-rare", /ultra|ace spec/i],
  ["double-rare", /double rare/i],
  ["rare-holo", /holo/i],
  ["rare", /rare/i],
  ["uncommon", /uncommon/i],
];

export function getRarityTier(rarity: string | null | undefined): RarityTier {
  if (!rarity) return "common";
  for (const [tier, pattern] of TIER_PATTERNS) {
    if (pattern.test(rarity)) return tier;
  }
  return "common";
}

// Common -> rarest, for sorting the shop grid by rarity (see the
// "rarity" ShopFilters sort option in lib/queries.ts).
const TIER_ORDER: RarityTier[] = [
  "common",
  "uncommon",
  "rare",
  "rare-holo",
  "double-rare",
  "ultra-rare",
  "illustration-rare",
  "special-illustration-rare",
  "secret-rare",
];

export function getRarityRank(rarity: string | null | undefined): number {
  return TIER_ORDER.indexOf(getRarityTier(rarity));
}

const TIER_CLASSES: Record<RarityTier, string> = {
  common: "border border-border bg-surface-raised text-muted",
  uncommon: "border border-transparent bg-emerald-500/15 text-emerald-400",
  rare: "border border-transparent bg-accent-blue/15 text-accent-blue",
  "rare-holo": "border border-transparent bg-cyan-500/15 text-cyan-300",
  "double-rare": "border border-transparent bg-violet-500/15 text-violet-300",
  "ultra-rare": "border border-transparent bg-accent-purple/15 text-accent-purple",
  "illustration-rare": "border border-transparent bg-pink-500/15 text-pink-400",
  "special-illustration-rare":
    "border border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-300",
  "secret-rare":
    "border border-transparent bg-gradient-to-r from-accent-yellow via-accent-red to-accent-purple font-bold text-slate-950",
};

export function getRarityBadgeClassName(rarity: string | null | undefined): string {
  return TIER_CLASSES[getRarityTier(rarity)];
}
