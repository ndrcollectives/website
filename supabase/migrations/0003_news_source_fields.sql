-- Adds fields for RSS-imported news items, which link out to their
-- original source rather than republishing full articles as our own.
-- Admin-authored articles simply leave these null.

alter table public.news_articles
  add column if not exists source_url text,
  add column if not exists source_name text;

-- Plain unique constraint, not a partial index: Postgres already treats
-- multiple NULLs (admin-authored articles with no source_url) as
-- non-conflicting under a standard unique constraint, and a plain
-- constraint is required for upsert's `on_conflict=source_url` to match
-- it (a partial index needs a matching predicate on the conflict target,
-- which a straightforward upsert call doesn't supply).
alter table public.news_articles
  add constraint news_articles_source_url_key unique (source_url);
