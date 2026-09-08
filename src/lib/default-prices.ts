import { getRarityTier, type RarityTier } from "@/lib/rarity";

// Rough starting-point prices, not real valuations — genuinely useful for
// the bulk end (common/uncommon/rare/double-rare) where per-card value
// clusters tightly, but chase rarities (ultra-rare and up) can fan out
// from ~€1 to well over €50 for the same tier depending on the specific
// card, so those are only meant as a first guess to override.
//
// common/uncommon/rare/double-rare are calibrated against real Pitch
// Black market data (Cardmarket-sourced, Sep 2026): Normal commons
// averaged ~€0.08, Normal uncommons ~€0.09, and their Reverse Holofoil
// prints landed at ~2x that — matching the Reverse Holofoil multiplier
// below. Double Rare (ex-Pokémon holo rares, always printed Holofoil)
// averaged ~€0.55.
//
// rare-holo (the pre-Scarlet & Violet label for a guaranteed-holo rare,
// used in older-block sets) has no real data behind it — it's treated
// as the same tier as double-rare (SV-era guaranteed-holo "ex" rares)
// and priced the same, rather than the old unreviewed €0.60 guess.
//
// illustration-rare/ultra-rare/special-illustration-rare/secret-rare
// are calibrated against PriceCharting data for the full Pitch Black
// special-art numbering above the base 84-card set (#85-120, each only
// printed Holofoil), which turned out to have three stacked bands:
// - #85-101: non-"ex" Pokémon (Illustration Rare) averaged ~€4.47
//   across 11 cards; "X ex" Pokémon (Ultra Rare) averaged ~€6.16
//   across 6 cards, in line with a real Ultra Rare Trainer (Gwynn) at
//   ~€7.12 — blended to ~€6.30.
// - #102-113: alt-art reprints of ordinary Trainer/Item cards (Special
//   Illustration Rare) averaged ~€4.85 across 12 cards — similar
//   magnitude to Illustration Rare despite the higher technical
//   rarity, since demand tracks the character/card depicted more than
//   the rarity label itself.
// - #114-120: alt-art reprints of the chase "ex" Pokémon plus a gold
//   parallel (Secret/Hyper Rare) averaged ~€81 across 7 cards, ranging
//   €25-€199 — by far the widest spread of any tier, so this one is
//   the roughest of the "real data" estimates.
export const BASE_PRICE_CENTS: Record<RarityTier, number> = {
  common: 8,
  uncommon: 10,
  rare: 12,
  "rare-holo": 20,
  "double-rare": 20,
  "ultra-rare": 252,
  "illustration-rare": 180,
  "special-illustration-rare": 195,
  "secret-rare": 3200,
};

export const VARIANT_MULTIPLIERS: Record<string, number> = {
  Normal: 1,
  "Reverse Holofoil": 2,
  Holofoil: 2.5,
  // Least reliable multiplier here — vintage 1st-edition value varies far
  // more than a flat multiplier can capture, always meant to be adjusted
  // by hand.
  "1st Edition": 3,
};

export function getSuggestedPriceCents(
  rarity: string | null | undefined,
  variant: string,
): number {
  const base = BASE_PRICE_CENTS[getRarityTier(rarity)];
  const multiplier = VARIANT_MULTIPLIERS[variant] ?? 1;
  return Math.round((base * multiplier) / 5) * 5;
}
