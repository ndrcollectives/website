"use client";

import { useEffect, useState } from "react";

// Module-level cache so every PriceTag on a page shares one fetch instead
// of each firing its own request to /api/exchange-rate.
let cachedRate: number | null = null;
let inFlight: Promise<number> | null = null;

async function fetchRate(): Promise<number> {
  if (cachedRate !== null) return cachedRate;
  if (!inFlight) {
    inFlight = fetch("/api/exchange-rate")
      .then((res) => res.json())
      .then((body: { usdToEur: number }) => {
        cachedRate = body.usdToEur;
        return cachedRate;
      })
      .catch(() => 0.92)
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

// Returns null until the rate has loaded — callers should just omit the
// EUR figure while it's null rather than showing a placeholder.
export function useEurRate(): number | null {
  const [rate, setRate] = useState<number | null>(cachedRate);

  useEffect(() => {
    if (rate !== null) return;
    let cancelled = false;
    fetchRate().then((r) => {
      if (!cancelled) setRate(r);
    });
    return () => {
      cancelled = true;
    };
  }, [rate]);

  return rate;
}
