// Print variant (Normal/Reverse Holofoil/etc.) isn't its own column on
// `products` — non-Normal variants are folded into the title as
// " · <Variant>" (see createProductFromCard), so this suffix is the only
// signal for products created via the quick-listing form. Older
// CSV-imported titles that don't follow this convention are treated as
// Normal.
export const VARIANT_ORDER = ["Normal", "Reverse Holofoil", "Holofoil", "1st Edition"] as const;

const TITLE_VARIANT_SUFFIXES: [string, string][] = [
  [" · 1st Edition", "1st Edition"],
  [" · Reverse Holofoil", "Reverse Holofoil"],
  [" · Holofoil", "Holofoil"],
];

export function variantFromTitle(title: string): string {
  for (const [suffix, variant] of TITLE_VARIANT_SUFFIXES) {
    if (title.endsWith(suffix)) return variant;
  }
  return "Normal";
}
