// The synced card catalog (see pokemon-tcg.ts) stores just the printed
// number (e.g. "180"), while admin-entered or imported card numbers often
// include the set's total as a denominator (e.g. "180/217"). Strip that
// suffix so the two can be matched reliably.
export function normalizeCardNumber(raw: string): string {
  return raw.trim().split("/")[0].trim();
}
