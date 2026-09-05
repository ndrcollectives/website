import Parser from "rss-parser";
import type { SupabaseClient } from "@supabase/supabase-js";

// Automated news is aggregated from RSS, not scraped/republished in full —
// each imported item is a headline + short excerpt with a link back to the
// original source. That's the standard, low-risk way to automate a news
// feed; republishing full third-party articles would be a copyright risk.
// Configure real feeds via NEWS_RSS_FEEDS (comma-separated URLs) — nothing
// is hardcoded here, since the operator should choose sources they trust
// and have the rights/permission to aggregate from.

export type NewsCategory =
  | "Set Release"
  | "Market News"
  | "Card Spoilers"
  | "Tournament";

export type SyncedArticle = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  cover_image_url: string | null;
  source_url: string;
  source_name: string;
  published_at: string;
};

const parser = new Parser({
  customFields: {
    item: [["media:content", "mediaContent"], ["enclosure", "enclosure"]],
  },
  headers: {
    // Many sites (Reddit included) block or error on requests with no
    // User-Agent, or one that identifies as a generic script/bot.
    "User-Agent":
      "Mozilla/5.0 (compatible; NDRCollectivesBot/1.0; +https://ndrcollectives.vercel.app)",
  },
});

function getConfiguredFeeds(): string[] {
  const raw = process.env.NEWS_RSS_FEEDS ?? "";
  return raw
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function inferCategory(title: string, summary: string): NewsCategory {
  const text = `${title} ${summary}`.toLowerCase();
  if (/(leak|spoiler|reveal|scan)/.test(text)) return "Card Spoilers";
  if (/(regional|championship|tournament|worlds|meta)/.test(text)) return "Tournament";
  if (/(release|set|expansion|preorder|pre-order)/.test(text)) return "Set Release";
  return "Market News";
}

function extractImage(item: Record<string, unknown>): string | null {
  const enclosure = item.enclosure as { url?: string } | undefined;
  if (enclosure?.url) return enclosure.url;

  const mediaContent = item.mediaContent as { $?: { url?: string } } | undefined;
  if (mediaContent?.$?.url) return mediaContent.$.url;

  return null;
}

export type FeedFetchResult = {
  articles: SyncedArticle[];
  // Feeds that failed to fetch/parse, so one bad URL doesn't take down
  // every other configured feed's sync.
  failures: { feedUrl: string; message: string }[];
};

export async function fetchNewsFromFeeds(): Promise<FeedFetchResult> {
  const feeds = getConfiguredFeeds();
  if (feeds.length === 0) {
    throw new Error(
      "No RSS feeds configured — set NEWS_RSS_FEEDS to a comma-separated list of feed URLs.",
    );
  }

  const articles: SyncedArticle[] = [];
  const failures: { feedUrl: string; message: string }[] = [];

  for (const feedUrl of feeds) {
    let feed;
    try {
      feed = await parser.parseURL(feedUrl);
    } catch (error) {
      failures.push({
        feedUrl,
        message: error instanceof Error ? error.message : String(error),
      });
      continue;
    }
    const sourceName = feed.title || new URL(feedUrl).hostname;

    for (const item of feed.items) {
      if (!item.title || !item.link) continue;

      const rawSummary = item.contentSnippet || item.content || item.summary || "";
      const summary = stripHtml(rawSummary);
      const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();

      articles.push({
        title: item.title,
        slug: `${slugify(item.title)}-${slugify(sourceName)}`,
        excerpt: truncate(summary, 200),
        content: summary,
        category: inferCategory(item.title, summary),
        cover_image_url: extractImage(item as unknown as Record<string, unknown>),
        source_url: item.link,
        source_name: sourceName,
        published_at: publishedAt,
      });
    }
  }

  if (articles.length === 0 && failures.length > 0) {
    throw new Error(
      failures.map((f) => `${f.feedUrl}: ${f.message}`).join("; "),
    );
  }

  return { articles, failures };
}

export type SyncNewsResult = {
  synced: number;
  failures: { feedUrl: string; message: string }[];
};

// Fetches configured feeds and upserts them into news_articles, matched by
// source_url so re-running the sync updates existing items instead of
// duplicating them. Shared by the admin "Sync" button and the cron route.
// A feed that fails to fetch is reported in `failures` rather than
// aborting the whole sync — the other configured feeds still go through.
export async function syncNewsArticles(
  supabase: SupabaseClient,
): Promise<SyncNewsResult> {
  const { articles, failures } = await fetchNewsFromFeeds();

  if (articles.length === 0) {
    return { synced: 0, failures };
  }

  const { error } = await supabase.from("news_articles").upsert(
    articles.map((a) => ({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      content: a.content,
      category: a.category,
      cover_image_url: a.cover_image_url,
      source_url: a.source_url,
      source_name: a.source_name,
      published_at: a.published_at,
      is_published: true,
    })),
    { onConflict: "source_url", ignoreDuplicates: false },
  );

  if (error) throw new Error(error.message);
  return { synced: articles.length, failures };
}
