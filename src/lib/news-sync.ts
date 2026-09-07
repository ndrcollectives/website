import Parser from "rss-parser";
import * as cheerio from "cheerio";
import type { SupabaseClient } from "@supabase/supabase-js";

// RSS-imported news is aggregated, not scraped/republished in full — each
// imported item is a headline + short excerpt with a link back to the
// original source. That's the standard, low-risk way to automate a news
// feed from third-party sources you don't control the rights to.
//
// The two official-press sources are treated differently: since they are
// The Pokémon Company's own press releases, explicitly published for
// media use, this pulls each release's full body text from its own
// detail page (see fetchArticleBody) and stores that as `content`,
// rather than only the listing page's one-line teaser.
//
// Three independent sources, all opt-in via env vars:
// - NEWS_RSS_FEEDS: comma-separated RSS feed URLs the operator chooses.
// - NEWS_OFFICIAL_PRESS: set to "true" to also pull from
//   https://press.pokemon.com/en, The Pokémon Company's own official press
//   site. It has no RSS feed, so this parses its plain server-rendered
//   HTML instead — more stable to scrape than a JS-rendered page, but
//   still not a stable public API, so it can break if they redesign it.
// - NEWS_OFFICIAL_PRESS_NL: same idea, for the Dutch/European press site
//   at https://pokemon.gamespress.com/nl. Same underlying CMS as the EN
//   site (near-identical markup) but a different domain, date format, and
//   summary markup, so it gets its own PressSiteConfig rather than being
//   folded into NEWS_OFFICIAL_PRESS — operators may want EN only, NL
//   only, both, or neither. Each article is tagged with a `locale` (see
//   ArticleLocale) so the site can show only articles matching a
//   visitor's current locale instead of one undifferentiated feed.

const USER_AGENT =
  "Mozilla/5.0 (compatible; NDRCollectivesBot/1.0; +https://ndrcollectives.vercel.app)";

type PressSiteConfig = {
  url: string;
  baseOrigin: string;
  sourceName: string;
  locale: ArticleLocale;
  parseDate: (dateText: string) => Date | null;
  getSummary: ($: cheerio.CheerioAPI, node: ReturnType<cheerio.CheerioAPI>) => string;
};

// press.pokemon.com's date text has parsed fine with the native Date
// constructor in practice; kept as-is rather than guessing its format.
function parseEnglishPressDate(dateText: string): Date | null {
  const parsed = new Date(dateText);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// pokemon.gamespress.com/nl dates are "d-m-yyyy" (e.g. "31-8-2026"),
// which the native Date constructor cannot be trusted to parse
// consistently (dash-separated dates are ambiguous between d-m-y and
// m-d-y across engines) — parsed explicitly instead.
function parseDutchPressDate(dateText: string): Date | null {
  const match = dateText.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const EN_PRESS_CONFIG: PressSiteConfig = {
  url: "https://press.pokemon.com/en",
  baseOrigin: "https://press.pokemon.com",
  sourceName: "Pokémon Official Press Site",
  locale: "en",
  parseDate: parseEnglishPressDate,
  getSummary: (_$, node) => node.find(".intro").first().text().trim().replace(/\s+/g, " "),
};

const NL_PRESS_CONFIG: PressSiteConfig = {
  url: "https://pokemon.gamespress.com/nl",
  baseOrigin: "https://pokemon.gamespress.com",
  sourceName: "Pokémon Persberichten (NL)",
  locale: "nl",
  parseDate: parseDutchPressDate,
  // Summary lives in ".one-language.intro em" and is often absent —
  // items with no <em> (just the localisations link) get an empty
  // summary, same as press items with no .intro text.
  getSummary: (_$, node) =>
    node.find(".one-language.intro em").first().text().trim().replace(/\s+/g, " "),
};

export type NewsCategory =
  | "Set Release"
  | "Market News"
  | "Card Spoilers"
  | "Tournament";

// Which site locale an article's content is written in — controls which
// locale's /news page it shows up on. RSS feeds and the EN press site
// are tagged "en"; the NL press site is tagged "nl".
export type ArticleLocale = "en" | "nl";

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
  locale: ArticleLocale;
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

function isOfficialPressNLEnabled(): boolean {
  return process.env.NEWS_OFFICIAL_PRESS_NL === "true";
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
  if (/(leak|spoiler|reveal|scan|onthulling|voorbeeldkaart)/.test(text)) return "Card Spoilers";
  if (/(regional|championship|tournament|worlds|meta|kampioenschap|toernooi)/.test(text))
    return "Tournament";
  if (/(release|set|expansion|preorder|pre-order|uitbreiding|lancering)/.test(text))
    return "Set Release";
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
        // Operator-configured RSS feeds aren't locale-tagged individually;
        // assumed English, matching every feed used on this site so far.
        locale: "en",
      });
    }
  }

  return { articles, failures };
}

// Parses a Gamespress-platform press site's plain server-rendered news
// list — each release is a `.newsItem` with a `.headline a`, `.date`,
// a summary, and a `figure img`. Neither the EN nor NL site offers an
// RSS feed, so this scrapes the same page a human visitor sees. The
// two sites share markup closely enough to use one parser, differing
// only in origin, date format, and where the summary text lives —
// captured in `config`.
async function fetchFromPressSite(config: PressSiteConfig): Promise<{
  articles: SyncedArticle[];
  failures: SourceFailure[];
}> {
  let html: string;
  try {
    const res = await fetch(config.url, {
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
          source: config.url,
          message: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }

  const $ = cheerio.load(html);

  type ListedItem = {
    title: string;
    sourceUrl: string;
    publishedAt: string;
    excerptText: string;
    imageSrc: string | null;
    editorialType: string;
  };

  const listed: ListedItem[] = [];

  $(".newsItem").each((_, el) => {
    const node = $(el);
    const headlineLink = node.find(".headline a").first();
    const title = headlineLink.text().trim().replace(/\s+/g, " ");
    const href = headlineLink.attr("href");
    if (!title || !href) return;

    const sourceUrl = new URL(href, config.baseOrigin).toString();
    const dateText = node.find(".date").first().text().trim();
    const parsedDate = dateText ? config.parseDate(dateText) : null;
    const publishedAt = parsedDate ? parsedDate.toISOString() : new Date().toISOString();

    const excerptText = config.getSummary($, node);
    const imageSrc = node.find("figure img").first().attr("src") ?? null;
    const editorialType = node.find(".editorial-type").first().text().trim();

    listed.push({ title, sourceUrl, publishedAt, excerptText, imageSrc, editorialType });
  });

  // The listing page only carries a one-line teaser per item — the full
  // release text lives on each item's own detail page, fetched here (one
  // request per listed item) so `content` holds the real article instead
  // of repeating the same short excerpt shown in the news list.
  const articles: SyncedArticle[] = await Promise.all(
    listed.map(async (item) => {
      const fullBody = await fetchArticleBody(item.sourceUrl);
      return {
        title: item.title,
        slug: `${slugify(item.title)}-${urlSuffix(item.sourceUrl)}`,
        excerpt: truncate(item.excerptText, 200),
        content: fullBody || item.excerptText || item.title,
        category: inferCategory(item.title, `${item.editorialType} ${item.excerptText}`),
        cover_image_url: item.imageSrc,
        source_url: item.sourceUrl,
        source_name: config.sourceName,
        published_at: item.publishedAt,
        locale: config.locale,
      };
    }),
  );

  return { articles, failures: [] };
}

// Fetches one article's own detail page and pulls its full body text
// from the standard schema.org `itemprop="articleBody"` container —
// both press sites run the same underlying CMS and mark up article
// bodies with this microdata attribute, so it's used instead of a class
// name that might legitimately differ between the two sites' templates.
// Returns null (falling back to the listing teaser as content) if the
// page can't be fetched or the container isn't found, rather than
// failing the whole sync over one article's detail page.
async function fetchArticleBody(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);
    const container = $('[itemprop="articleBody"]').first();
    if (container.length === 0) return null;

    return extractArticleBody($, container) || null;
  } catch {
    return null;
  }
}

// Cheerio's .text() drops <br>/<p> boundaries as plain whitespace, which
// would run these press releases' many <br><br>-separated paragraphs and
// pull quotes together into one unreadable wall of text. Each top-level
// block is walked individually, and <br>/<p>/<div> boundaries are turned
// into paragraph breaks before extracting text, so the stored plain-text
// content keeps readable paragraph structure.
function extractArticleBody(
  $: cheerio.CheerioAPI,
  container: ReturnType<cheerio.CheerioAPI>,
): string {
  const parts: string[] = [];

  container.children().each((_, el) => {
    const $el = $(el);

    if ($el.is("ul, ol")) {
      $el.find("li").each((_, li) => {
        const text = htmlFragmentToParagraphs($(li).html() ?? "").join(" ");
        if (text) parts.push(`• ${text}`);
      });
      return;
    }

    const html = $el.html();
    if (html) parts.push(...htmlFragmentToParagraphs(html));
  });

  return parts.join("\n\n").trim();
}

function htmlFragmentToParagraphs(html: string): string[] {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n\n");
  const text = cheerio.load(withBreaks)("body").text();
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
}

export type FeedFetchResult = {
  articles: SyncedArticle[];
  // Sources that failed to fetch/parse, so one bad source doesn't take
  // down every other configured source's sync.
  failures: SourceFailure[];
};

export async function fetchConfiguredNews(): Promise<FeedFetchResult> {
  const officialPressEnabled = isOfficialPressEnabled();
  const officialPressNLEnabled = isOfficialPressNLEnabled();
  const feeds = getConfiguredFeeds();

  if (feeds.length === 0 && !officialPressEnabled && !officialPressNLEnabled) {
    throw new Error(
      "No news sources configured — set NEWS_RSS_FEEDS, NEWS_OFFICIAL_PRESS=true, and/or NEWS_OFFICIAL_PRESS_NL=true.",
    );
  }

  const [rssResult, pressResult, pressNLResult] = await Promise.all([
    feeds.length > 0
      ? fetchFromRssFeeds()
      : Promise.resolve({ articles: [], failures: [] }),
    officialPressEnabled
      ? fetchFromPressSite(EN_PRESS_CONFIG)
      : Promise.resolve({ articles: [], failures: [] }),
    officialPressNLEnabled
      ? fetchFromPressSite(NL_PRESS_CONFIG)
      : Promise.resolve({ articles: [], failures: [] }),
  ]);

  const articles = [...rssResult.articles, ...pressResult.articles, ...pressNLResult.articles];
  const failures = [...rssResult.failures, ...pressResult.failures, ...pressNLResult.failures];

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
      locale: a.locale,
      is_published: true,
    })),
    { onConflict: "source_url", ignoreDuplicates: false },
  );

  if (error) throw new Error(error.message);
  return { synced: articles.length, failures };
}
