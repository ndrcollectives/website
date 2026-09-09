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
// Cross-checked against four further independent sets (Collectr-
// sourced): Shrouded Fable (Normal commons ~€0.11 n=7, excluding the
// set's alt-art basic-energy inserts as outliers — those alone
// averaged ~€0.39; Normal uncommons ~€0.15 n=3), Perfect Order
// (Normal commons ~€0.07 n=10; Normal uncommons ~€0.09 n=3), Ascended
// Heroes (Normal commons ~€0.14 n=6; Normal uncommons ~€0.16 n=3),
// and Chaos Rising (Normal commons ~€0.12 n=10; Normal uncommons
// ~€0.14 n=1) — all matching the same ~2x Reverse Holofoil ratio.
// Blending all five sets' commons/uncommons lands common at ~€0.10
// and uncommon at ~€0.11 (both close to unchanged and stabilizing).
// Rare blended to ~€0.10 base across all five sets' Holofoil/Reverse
// Holofoil data.
//
// Double Rare is the one tier where the sets genuinely disagree, not
// just noisy-sample disagree: Pitch Black (~€0.55, n=6) and Perfect
// Order (~€0.54, n=2) agree closely; Ascended Heroes' two Double
// Rares (Erika's Vileplume ex, Mega Meganium ex) both landed near
// €1 — a real ~2x premium, plausibly reflecting its release date
// rather than measurement noise, since both its data points agree
// with each other; Chaos Rising's two Double Rares (Beedrill ex,
// Mega Pyroar ex) landed in between at ~€0.72. Release recency alone
// doesn't explain it either — Chaos Rising released even more
// recently than Ascended Heroes (May vs. Jan 2026) yet priced lower,
// so character/set demand plays a role too. Blending all four sets
// brings the base to €0.26 (Holofoil suggestion ~€0.65) — still just
// a starting point per card/set, more so for this tier than any
// other.
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
  common: 10,
  uncommon: 11,
  rare: 10,
  "rare-holo": 26,
  "double-rare": 26,
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
