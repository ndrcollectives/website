// The synced card catalog (see pokemon-tcg.ts) stores just the printed
// number, unpadded (e.g. "4", "91", "180"), while admin-entered or
// imported card numbers often include the set's total as a denominator
// and zero-pad to match its digit count (e.g. "004/217", "091/217").
// Strip the denominator and, for purely numeric numbers, the padding —
// promo-style codes like "SWSH001" or "TG01" are left as-is since they
// aren't just a padded integer.
export function normalizeCardNumber(raw: string): string {
  const base = raw.trim().split("/")[0].trim();
  return /^\d+$/.test(base) ? String(Number(base)) : base;
}

// A search like "018/132" names a specific card in a specific set — the
// denominator is that set's total card count, not just padding to strip.
// Used to scope a number search to the one set it actually points at,
// rather than matching card #18 across every set that happens to have one.
export function parseSetNumber(raw: string): { number: string; total: number } | null {
  const match = raw.trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) return null;
  return { number: match[1], total: Number(match[2]) };
}
