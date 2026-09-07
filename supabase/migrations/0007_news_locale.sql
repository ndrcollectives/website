-- Tags each news article with the language it's written in, so the
-- news pages can show only articles matching the visitor's site locale
-- instead of one undifferentiated EN+NL list. Existing rows (RSS +
-- English press site, added before the Dutch source existed) are all
-- English content, so they default/backfill to 'en'.

alter table public.news_articles
  add column if not exists locale text not null default 'en'
    check (locale in ('en', 'nl'));
