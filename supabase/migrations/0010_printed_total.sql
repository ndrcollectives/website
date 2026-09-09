-- The number printed on a card ("011/217") uses the set's *printed* card
-- count as its denominator — which for sets with secret rares differs from
-- the full card count (pokemon-tcg-data's `total` vs `printedTotal`; e.g.
-- Mega Evolution is total=188 but printedTotal=132). We were only storing
-- `total` as total_cards, so nothing could match a search by that printed
-- denominator without either false negatives (exact match against the
-- wrong number) or false positives (matching some unrelated set that also
-- has a card at that number).
alter table public.sets add column if not exists printed_total integer;

-- Backfill: for existing rows (including manually-entered sets that were
-- never synced from the API) the best available guess is total_cards
-- itself — correct for any set without secret rares, and for the
-- pokemon-tcg-data-synced ones, re-running "Sync Sets" after this
-- migration corrects it to the real printedTotal value.
update public.sets set printed_total = total_cards where printed_total is null;
