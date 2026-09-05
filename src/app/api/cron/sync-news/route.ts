import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncNewsArticles } from "@/lib/news-sync";

// Triggered on a schedule (see vercel.json) to pull in new RSS items
// without an admin having to remember to click "Sync" in the dashboard.
// No-ops with a clear message if NEWS_RSS_FEEDS isn't configured yet.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!process.env.NEWS_RSS_FEEDS) {
    return NextResponse.json({ skipped: "NEWS_RSS_FEEDS not configured" });
  }

  try {
    const supabase = createAdminClient();
    const synced = await syncNewsArticles(supabase);
    return NextResponse.json({ synced });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
