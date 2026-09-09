// Print variant (Normal/Reverse Holofoil/etc.) isn't its own column on
// `products` — non-Normal variants are folded into the title as
// " · <Variant>" (see createProductFromCard), so this suffix is the only
// signal for products created via the quick-listing form. Older
// CSV-imported titles that don't follow this convention are treated as
// Normal.
export const VARIANT_ORDER = ["Normal", "Reverse Holofoil", "Holofoil", "1st Edition"] as const;
export type BaseVariant = (typeof VARIANT_ORDER)[number];

const TITLE_VARIANT_SUFFIXES: [string, BaseVariant][] = [
  [" · 1st Edition", "1st Edition"],
  [" · Reverse Holofoil", "Reverse Holofoil"],
  [" · Holofoil", "Holofoil"],
];

// Base-tier cards often print Reverse Holofoil in more than one foil
// pattern per card (e.g. "Poke Ball", "Energy Symbol Pattern", "Friend
// Ball") — captured as an optional "(<Pattern>)" suffix after the
// variant, so each pattern can be listed and priced as its own row
// while still bucketing to the same "Reverse Holofoil" base variant for
// sorting and default-price lookup.
const PATTERN_SUFFIX = / · Reverse Holofoil \((.+)\)$/;

export function variantFromTitle(title: string): BaseVariant {
  if (PATTERN_SUFFIX.test(title)) return "Reverse Holofoil";
  for (const [suffix, variant] of TITLE_VARIANT_SUFFIXES) {
    if (title.endsWith(suffix)) return variant;
  }
  return "Normal";
}

// Returns the named foil pattern encoded in the title, if any (e.g.
// "Poke Ball"), or null for a plain Reverse Holofoil / any other variant.
export function patternFromTitle(title: string): string | null {
  return title.match(PATTERN_SUFFIX)?.[1] ?? null;
}

export function buildVariantTitle(
  cardName: string,
  variant: string,
  pattern?: string | null,
): string {
  if (variant === "Normal") return cardName;
  if (variant === "Reverse Holofoil" && pattern) {
    return `${cardName} · Reverse Holofoil (${pattern})`;
  }
  return `${cardName} · ${variant}`;
}
