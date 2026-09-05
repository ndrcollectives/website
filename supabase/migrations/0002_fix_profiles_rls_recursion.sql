-- Fixes "infinite recursion detected in policy for relation profiles".
--
-- The original admin policies on public.profiles queried public.profiles
-- again (to check the caller's role), which re-triggered the same RLS
-- policy on that inner query, which queried profiles again, forever. Any
-- select against profiles as a logged-in user hit this and failed, which
-- is why login "succeeded" (a session cookie was set) but the app could
-- never load the resulting profile and just bounced back to sign-in.
--
-- Fix: move the admin check into a SECURITY DEFINER function. Such a
-- function runs with the privileges of its owner (the migration role,
-- effectively postgres), which bypasses RLS for its own internal query,
-- so checking admin-ness no longer re-triggers the policy being evaluated.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can manage all profiles" on public.profiles;

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- The other tables' admin policies have the exact same recursion-shaped
-- query (a `select ... from public.profiles p where p.id = auth.uid() ...`
-- inside a policy), but on a *different* table than the one being
-- checked (sets/products/news_articles/orders/order_items), so they don't
-- recurse — only a policy that queries its own table recurses. They're
-- switched to the same helper anyway for consistency and one shared
-- place to change admin logic later.
drop policy if exists "Admins can manage sets" on public.sets;
create policy "Admins can manage sets"
  on public.sets for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can view all products" on public.products;
create policy "Admins can view all products"
  on public.products for select
  using (public.is_admin());

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can view all articles" on public.news_articles;
create policy "Admins can view all articles"
  on public.news_articles for select
  using (public.is_admin());

drop policy if exists "Admins can manage articles" on public.news_articles;
create policy "Admins can manage articles"
  on public.news_articles for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

drop policy if exists "Admins can manage orders" on public.orders;
create policy "Admins can manage orders"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items"
  on public.order_items for select
  using (public.is_admin());

drop policy if exists "Admins can manage order items" on public.order_items;
create policy "Admins can manage order items"
  on public.order_items for all
  using (public.is_admin())
  with check (public.is_admin());
