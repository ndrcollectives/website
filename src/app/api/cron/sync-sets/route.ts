import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllSets } from "@/lib/pokemon-tcg";

// Triggered on a schedule (see vercel.json) to keep official set data
// (release dates, card counts, artwork) current without an admin having
// to remember to click "Sync" in the dashboard.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();
  const sets = await fetchAllSets();

  const { error } = await supabase.from("sets").upsert(
    sets.map((s) => ({
      name: s.name,
      code: s.code,
      era: s.era,
      release_date: s.release_date,
      total_cards: s.total_cards,
      logo_url: s.logo_url,
      is_upcoming: s.is_upcoming,
    })),
    { onConflict: "code", ignoreDuplicates: false },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ synced: sets.length });
}
