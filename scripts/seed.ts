// Seeds sample sets, products, and news articles for local development.
// Usage: npx tsx scripts/seed.ts
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const { data: sets, error: setsError } = await supabase
    .from("sets")
    .upsert(
      [
        {
          name: "Prismatic Evolutions",
          code: "PRE",
          era: "Scarlet & Violet",
          release_date: "2025-01-17",
          total_cards: 180,
          is_upcoming: false,
        },
        {
          name: "151",
          code: "MEW",
          era: "Scarlet & Violet",
          release_date: "2023-10-06",
          total_cards: 207,
          is_upcoming: false,
        },
        {
          name: "Paldean Fates",
          code: "PAF",
          era: "Scarlet & Violet",
          release_date: "2024-01-26",
          total_cards: 245,
          is_upcoming: false,
        },
        {
          name: "Mega Evolution Debut",
          code: "MEG",
          era: "Scarlet & Violet",
          release_date: "2026-02-06",
          total_cards: 190,
          is_upcoming: true,
        },
      ],
      { onConflict: "code" },
    )
    .select();

  if (setsError) throw setsError;
  console.log(`Seeded ${sets?.length ?? 0} sets`);

  const mewSet = sets?.find((s) => s.code === "MEW");

  const { data: products, error: productsError } = await supabase
    .from("products")
    .upsert(
      [
        {
          title: "Charizard ex - Special Illustration Rare",
          slug: "charizard-ex-sir-151",
          description: "151 Charizard ex Special Illustration Rare.",
          product_type: "single",
          set_id: mewSet?.id,
          card_number: "215/165",
          rarity: "Special Illustration Rare",
          condition: "NM",
          price_cents: 45000,
          compare_at_price_cents: 52000,
          inventory_count: 4,
          is_preorder: false,
          images: [],
          is_featured: true,
        },
        {
          title: "151 Booster Box",
          slug: "151-booster-box",
          description: "Factory sealed 151 booster box, 36 packs.",
          product_type: "sealed_box",
          set_id: mewSet?.id,
          price_cents: 16999,
          inventory_count: 12,
          is_preorder: false,
          images: [],
          is_featured: true,
        },
        {
          title: "151 Elite Trainer Box",
          slug: "151-etb",
          description: "151 Elite Trainer Box with 9 booster packs.",
          product_type: "etb",
          set_id: mewSet?.id,
          price_cents: 4999,
          inventory_count: 20,
          is_preorder: false,
          images: [],
          is_featured: true,
        },
      ],
      { onConflict: "slug" },
    )
    .select();

  if (productsError) throw productsError;
  console.log(`Seeded ${products?.length ?? 0} products`);

  const { data: articles, error: articlesError } = await supabase
    .from("news_articles")
    .upsert(
      [
        {
          title: "Mega Evolution Debut Set Revealed",
          slug: "mega-evolution-debut-revealed",
          content:
            "The Pokémon Company has revealed the next major Scarlet & Violet expansion, Mega Evolution Debut, launching February 2026 with a full roster of returning Mega Evolutions.",
          excerpt: "A first look at the upcoming Mega Evolution Debut expansion.",
          category: "Set Release",
          is_published: true,
          published_at: new Date().toISOString(),
        },
      ],
      { onConflict: "slug" },
    )
    .select();

  if (articlesError) throw articlesError;
  console.log(`Seeded ${articles?.length ?? 0} articles`);
}

main()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
