// USD is the store's real currency (Stripe checkout, all stored
// price_cents) — this is only for showing an approximate EUR figure
// alongside it. frankfurter.app mirrors the ECB's daily reference rates,
// is free, and needs no API key. A stale hardcoded fallback keeps the
// site working (just with a slightly-off estimate) if it's unreachable.
const FALLBACK_USD_TO_EUR = 0.92;

export async function getUsdToEurRate(): Promise<number> {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR", {
      next: { revalidate: 21600 }, // 6 hours — this rate doesn't need to be live
    });
    if (!res.ok) return FALLBACK_USD_TO_EUR;
    const body = (await res.json()) as { rates?: { EUR?: number } };
    return body.rates?.EUR ?? FALLBACK_USD_TO_EUR;
  } catch {
    return FALLBACK_USD_TO_EUR;
  }
}
