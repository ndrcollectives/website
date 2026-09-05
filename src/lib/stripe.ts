import Stripe from "stripe";

let cached: Stripe | null = null;

// Lazily constructed so importing this module — which Next.js does while
// collecting page data at build time — never requires STRIPE_SECRET_KEY to
// be set. The key is only needed once a checkout/webhook route actually runs.
function getStripe(): Stripe {
  if (!cached) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    cached = new Stripe(apiKey, {
      apiVersion: "2026-08-26.dahlia",
      appInfo: {
        name: "NDR Collectives",
      },
    });
  }
  return cached;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripe(), prop, receiver);
  },
});
