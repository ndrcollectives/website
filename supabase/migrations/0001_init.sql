-- NDR Collectives initial schema
-- Tables: profiles, sets, products, news_articles, orders, order_items
-- Full RLS policies per spec.

create extension if not exists "pgcrypto";

-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- sets
-- ============================================================
create table if not exists public.sets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  era text not null,
  release_date date not null,
  total_cards integer not null default 0,
  logo_url text,
  banner_url text,
  is_upcoming boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.sets enable row level security;

create policy "Sets are publicly readable"
  on public.sets for select
  using (true);

create policy "Admins can manage sets"
  on public.sets for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- products
-- ============================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  product_type text not null check (
    product_type in ('single', 'sealed_box', 'etb', 'pack', 'graded_slab')
  ),
  set_id uuid references public.sets (id) on delete set null,
  card_number text,
  rarity text,
  condition text,
  price_cents integer not null check (price_cents >= 0),
  compare_at_price_cents integer,
  inventory_count integer not null default 0,
  is_preorder boolean not null default false,
  images text[] not null default '{}',
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists products_set_id_idx on public.products (set_id);
create index if not exists products_product_type_idx on public.products (product_type);
create index if not exists products_rarity_idx on public.products (rarity);

alter table public.products enable row level security;

create policy "Products are publicly readable"
  on public.products for select
  using (inventory_count > 0 or is_preorder = true);

create policy "Admins can view all products"
  on public.products for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins can manage products"
  on public.products for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- news_articles
-- ============================================================
create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  category text not null check (
    category in ('Set Release', 'Market News', 'Card Spoilers', 'Tournament')
  ),
  cover_image_url text,
  author_id uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  is_published boolean not null default false
);

alter table public.news_articles enable row level security;

create policy "Published articles are publicly readable"
  on public.news_articles for select
  using (is_published = true);

create policy "Admins can view all articles"
  on public.news_articles for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins can manage articles"
  on public.news_articles for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- orders
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  stripe_session_id text not null unique,
  stripe_payment_intent_id text,
  status text not null default 'pending' check (
    status in ('pending', 'paid', 'shipped', 'cancelled', 'refunded')
  ),
  total_amount_cents integer not null default 0,
  shipping_address jsonb,
  tracking_number text,
  carrier text,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);

alter table public.orders enable row level security;

create policy "Customers can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins can manage orders"
  on public.orders for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- order_items
-- ============================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

create policy "Customers can view their own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "Admins can view all order items"
  on public.order_items for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins can manage order items"
  on public.order_items for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- Atomic inventory decrement, used by the Stripe webhook handler
-- ============================================================
create or replace function public.decrement_inventory(p_product_id uuid, p_quantity integer)
returns void
language sql
security definer set search_path = public
as $$
  update public.products
  set inventory_count = greatest(inventory_count - p_quantity, 0)
  where id = p_product_id;
$$;

-- ============================================================
-- Storage buckets for card scans and news banner assets
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('news-assets', 'news-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('set-assets', 'set-assets', true)
on conflict (id) do nothing;

create policy "Public read for product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Public read for news assets"
  on storage.objects for select
  using (bucket_id = 'news-assets');

create policy "Public read for set assets"
  on storage.objects for select
  using (bucket_id = 'set-assets');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can upload news assets"
  on storage.objects for insert
  with check (
    bucket_id = 'news-assets'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can upload set assets"
  on storage.objects for insert
  with check (
    bucket_id = 'set-assets'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
