-- Personal card collection tracker ("My Binder"). Distinct from
-- `favorites` (a wishlist of cards someone wants) — a binder holds cards
-- someone already owns, with quantity/variant/condition. Purely private to
-- the owning user, same spirit as other personal account data: no admin
-- override policy.
create table if not exists public.binders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists binders_user_id_idx on public.binders (user_id);

alter table public.binders enable row level security;

create policy "Users can view their own binders"
  on public.binders for select
  using (auth.uid() = user_id);

create policy "Users can manage their own binders"
  on public.binders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- One row per (card, variant, condition) actually owned, not one row per
-- physical card — quantity covers duplicates, matching how the shop's own
-- listings are modeled (see product-variant.ts).
create table if not exists public.binder_items (
  id uuid primary key default gen_random_uuid(),
  binder_id uuid not null references public.binders (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete cascade,
  variant text not null default 'Normal',
  condition text,
  quantity integer not null default 1 check (quantity > 0),
  added_at timestamptz not null default now(),
  unique (binder_id, card_id, variant, condition)
);

create index if not exists binder_items_binder_id_idx on public.binder_items (binder_id);
create index if not exists binder_items_card_id_idx on public.binder_items (card_id);

alter table public.binder_items enable row level security;

create policy "Users can view items in their own binders"
  on public.binder_items for select
  using (exists (
    select 1 from public.binders b
    where b.id = binder_items.binder_id and b.user_id = auth.uid()
  ));

create policy "Users can manage items in their own binders"
  on public.binder_items for all
  using (exists (
    select 1 from public.binders b
    where b.id = binder_items.binder_id and b.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.binders b
    where b.id = binder_items.binder_id and b.user_id = auth.uid()
  ));
