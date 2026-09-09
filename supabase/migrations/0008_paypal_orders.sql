-- Orders can now come from either payment provider — Stripe (existing) or
-- direct PayPal Orders API (new). stripe_session_id was the only
-- provider-linking column so far; loosen it to nullable and add PayPal's
-- equivalent, tagged by a new payment_provider column so the rest of the
-- app (refunds, admin display) knows which API to call.
alter table public.orders
  alter column stripe_session_id drop not null;

alter table public.orders
  add column if not exists payment_provider text not null default 'stripe'
    check (payment_provider in ('stripe', 'paypal')),
  add column if not exists paypal_order_id text unique,
  add column if not exists paypal_capture_id text;
