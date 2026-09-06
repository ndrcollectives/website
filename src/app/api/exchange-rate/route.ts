import { NextResponse } from "next/server";
import { getUsdToEurRate } from "@/lib/exchange-rate";

// Backs the client-side PriceTag component — client components can't call
// the server-only cached fetch in lib/exchange-rate.ts directly.
export async function GET() {
  const usdToEur = await getUsdToEurRate();
  return NextResponse.json(
    { usdToEur },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
