// Checkout fees, kept as pure functions shared between the cart page
// (client-side preview) and the checkout route (server-side, source of
// truth for what's actually charged) so the two can never drift apart.

// Mirrors Stripe's own EU-card processing rate (1.5% + €0.25) — this fee
// exists to cover that real, unavoidable cost, not as an added margin.
const TRANSACTION_FEE_PERCENT = 0.015;
const TRANSACTION_FEE_FLAT_CENTS = 25;

// Flat rate for all orders. Not carrier-calculated, so it's shown as a
// fixed amount everywhere rather than "calculated at checkout".
export const SHIPPING_FLAT_CENTS = 455;

export function calculateTransactionFeeCents(subtotalCents: number): number {
  return Math.round(subtotalCents * TRANSACTION_FEE_PERCENT) + TRANSACTION_FEE_FLAT_CENTS;
}
