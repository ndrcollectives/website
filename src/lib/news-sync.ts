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

export async function fetchNewsFromFeeds(): Promise<SyncedArticle[]> {
  const feeds = getConfiguredFeeds();
  if (feeds.length === 0) {
    throw new Error(
      "No RSS feeds configured — set NEWS_RSS_FEEDS to a comma-separated list of feed URLs.",
    );
  }

  const results: SyncedArticle[] = [];

  for (const feedUrl of feeds) {
    const feed = await parser.parseURL(feedUrl);
    const sourceName = feed.title || new URL(feedUrl).hostname;

    for (const item of feed.items) {
      if (!item.title || !item.link) continue;

      const rawSummary = item.contentSnippet || item.content || item.summary || "";
      const summary = stripHtml(rawSummary);
      const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();

      results.push({
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

  return results;
}

// Fetches configured feeds and upserts them into news_articles, matched by
// source_url so re-running the sync updates existing items instead of
// duplicating them. Shared by the admin "Sync" button and the cron route.
export async function syncNewsArticles(
  supabase: SupabaseClient,
): Promise<number> {
  const articles = await fetchNewsFromFeeds();

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
  return articles.length;
}
