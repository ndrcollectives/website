import Parser from "rss-parser";
import * as cheerio from "cheerio";
import type { SupabaseClient } from "@supabase/supabase-js";

// Automated news is aggregated, not scraped/republished in full — each
// imported item is a headline + short excerpt with a link back to the
// original source. That's the standard, low-risk way to automate a news
// feed; republishing full third-party articles would be a copyright risk.
//
// Two independent sources, both opt-in via env vars:
// - NEWS_RSS_FEEDS: comma-separated RSS feed URLs the operator chooses.
// - NEWS_OFFICIAL_PRESS: set to "true" to also pull from
//   https://press.pokemon.com/en, The Pokémon Company's own official press
//   site. It has no RSS feed, so this parses its plain server-rendered
//   HTML instead — more stable to scrape than a JS-rendered page, but
//   still not a stable public API, so it can break if they redesign it.

const PRESS_SITE_URL = "https://press.pokemon.com/en";
const USER_AGENT =
  "Mozilla/5.0 (compatible; NDRCollectivesBot/1.0; +https://ndrcollectives.vercel.app)";

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
    "User-Agent": USER_AGENT,
  },
});

function getConfiguredFeeds(): string[] {
  const raw = process.env.NEWS_RSS_FEEDS ?? "";
  return raw
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}

function isOfficialPressEnabled(): boolean {
  return process.env.NEWS_OFFICIAL_PRESS === "true";
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// A short, deterministic hash of the source URL. slug carries its own
// unique constraint separate from the upsert's source_url conflict
// target, and titles alone can collide after slugify strips accents/
// punctuation (e.g. two similarly-worded releases) — tying the slug
// suffix to the URL instead guarantees it's exactly as unique as
// source_url already is.
function urlSuffix(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash * 31 + url.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
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

type SourceFailure = { source: string; message: string };

async function fetchFromRssFeeds(): Promise<{
  articles: SyncedArticle[];
  failures: SourceFailure[];
}> {
  const feeds = getConfiguredFeeds();
  const articles: SyncedArticle[] = [];
  const failures: SourceFailure[] = [];

  for (const feedUrl of feeds) {
    let feed;
    try {
      feed = await parser.parseURL(feedUrl);
    } catch (error) {
      failures.push({
        source: feedUrl,
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
        slug: `${slugify(item.title)}-${urlSuffix(item.link)}`,
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

  return { articles, failures };
}

// Parses https://press.pokemon.com/en's plain server-rendered "Recent
// News" list — each release is a `.newsItem` with a `.headline a`,
// `.date`, `.intro` excerpt, and a `figure img`. No RSS is offered here,
// so this scrapes the same page a human visitor sees.
async function fetchFromOfficialPress(): Promise<{
  articles: SyncedArticle[];
  failures: SourceFailure[];
}> {
  let html: string;
  try {
    const res = await fetch(PRESS_SITE_URL, {
      headers: { "User-Agent": USER_AGENT },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Status code ${res.status}`);
    }
    html = await res.text();
  } catch (error) {
    return {
      articles: [],
      failures: [
        {
          source: PRESS_SITE_URL,
          message: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }

  const $ = cheerio.load(html);
  const articles: SyncedArticle[] = [];

  $(".newsItem").each((_, el) => {
    const node = $(el);
    const headlineLink = node.find(".headline a").first();
    const title = headlineLink.text().trim().replace(/\s+/g, " ");
    const href = headlineLink.attr("href");
    if (!title || !href) return;

    const sourceUrl = new URL(href, PRESS_SITE_URL).toString();
    const dateText = node.find(".date").first().text().trim();
    const parsedDate = dateText ? new Date(dateText) : null;
    const publishedAt =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toISOString()
        : new Date().toISOString();

    const excerptText = node.find(".intro").first().text().trim().replace(/\s+/g, " ");
    const imageSrc = node.find("figure img").first().attr("src") ?? null;
    const editorialType = node.find(".editorial-type").first().text().trim();

    articles.push({
      title,
      slug: `${slugify(title)}-${urlSuffix(sourceUrl)}`,
      excerpt: truncate(excerptText, 200),
      content: excerptText || title,
      category: inferCategory(title, `${editorialType} ${excerptText}`),
      cover_image_url: imageSrc,
      source_url: sourceUrl,
      source_name: "Pokémon Official Press Site",
      published_at: publishedAt,
    });
  });

  return { articles, failures: [] };
}

export type FeedFetchResult = {
  articles: SyncedArticle[];
  // Sources that failed to fetch/parse, so one bad source doesn't take
  // down every other configured source's sync.
  failures: SourceFailure[];
};

export async function fetchConfiguredNews(): Promise<FeedFetchResult> {
  const officialPressEnabled = isOfficialPressEnabled();
  const feeds = getConfiguredFeeds();

  if (feeds.length === 0 && !officialPressEnabled) {
    throw new Error(
      "No news sources configured — set NEWS_RSS_FEEDS and/or NEWS_OFFICIAL_PRESS=true.",
    );
  }

  const [rssResult, pressResult] = await Promise.all([
    feeds.length > 0
      ? fetchFromRssFeeds()
      : Promise.resolve({ articles: [], failures: [] }),
    officialPressEnabled
      ? fetchFromOfficialPress()
      : Promise.resolve({ articles: [], failures: [] }),
  ]);

  const articles = [...rssResult.articles, ...pressResult.articles];
  const failures = [...rssResult.failures, ...pressResult.failures];

  if (articles.length === 0 && failures.length > 0) {
    throw new Error(failures.map((f) => `${f.source}: ${f.message}`).join("; "));
  }

  return { articles, failures };
}

export type SyncNewsResult = {
  synced: number;
  failures: SourceFailure[];
};

// Fetches all configured sources and upserts them into news_articles,
// matched by source_url so re-running the sync updates existing items
// instead of duplicating them. Shared by the admin "Sync" button and the
// cron route.
export async function syncNewsArticles(
  supabase: SupabaseClient,
): Promise<SyncNewsResult> {
  const { articles, failures } = await fetchConfiguredNews();

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
