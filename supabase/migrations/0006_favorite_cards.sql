-- Extend favorites to also cover catalog cards, not just listed products.
-- Not every card in a set has a matching listing yet, so browsing a set's
-- full checklist (/sets/[code]) is where someone would want to save a card
-- they don't see for sale — to revisit, and later (future work) to be
-- notified when it's listed.

alter table public.favorites
  alter column product_id drop not null,
  add column if not exists card_id uuid references public.cards (id) on delete cascade;

alter table public.favorites
  add constraint favorites_exactly_one_target check (
    (product_id is not null and card_id is null) or
    (product_id is null and card_id is not null)
  );

create unique index if not exists favorites_user_card_unique
  on public.favorites (user_id, card_id)
  where card_id is not null;

create index if not exists favorites_card_id_idx on public.favorites (card_id);
