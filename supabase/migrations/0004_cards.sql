-- Per-set card checklist, populated from the Pokémon TCG API. This is
-- reference/checklist data (every card printed in a set, with real card
-- art) — separate from `products`, which is only what's actually for
-- sale. A set can have hundreds of cards synced here with none of them
-- listed for sale, and vice versa.

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.sets (id) on delete cascade,
  api_id text not null unique,
  name text not null,
  number text not null,
  rarity text,
  supertype text,
  image_small text,
  image_large text,
  artist text,
  created_at timestamptz not null default now()
);

create index if not exists cards_set_id_idx on public.cards (set_id);

alter table public.cards enable row level security;

create policy "Cards are publicly readable"
  on public.cards for select
  using (true);

create policy "Admins can manage cards"
  on public.cards for all
  using (public.is_admin())
  with check (public.is_admin());
