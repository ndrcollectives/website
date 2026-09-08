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
// averaged ~€0.55. ultra-rare is calibrated from a real Ultra Rare
// (Gwynn, Pitch Black, Holofoil) trading around €7.
export const BASE_PRICE_CENTS: Record<RarityTier, number> = {
  common: 8,
  uncommon: 10,
  rare: 12,
  "rare-holo": 60,
  "double-rare": 20,
  "ultra-rare": 320,
  "illustration-rare": 350,
  "secret-rare": 600,
  "special-illustration-rare": 800,
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
