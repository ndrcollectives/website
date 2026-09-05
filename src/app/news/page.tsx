import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { getPublishedArticles } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "News & Release Calendar",
  description:
    "Pokémon TCG editorial news: official releases, competitive meta, rumors & leaks, and card spoilers.",
};

const CATEGORIES = [
  "Set Release",
  "Market News",
  "Card Spoilers",
  "Tournament",
] as const;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const articles = await getPublishedArticles(category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">News & Editorial</h1>
      <p className="mt-2 text-muted">
        Official releases, competitive meta, rumors & leaks, and card
        spoilers.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/news"
          className={`rounded-full border px-3 py-1 text-sm ${
            !category
              ? "border-accent-yellow bg-accent-yellow/10 text-accent-yellow"
              : "border-border text-muted hover:border-accent-yellow/50"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/news?category=${encodeURIComponent(c)}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              category === c
                ? "border-accent-yellow bg-accent-yellow/10 text-accent-yellow"
                : "border-border text-muted hover:border-accent-yellow/50"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <p className="mt-16 text-center text-muted">
          No articles published yet. Check back soon.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent-yellow/50"
            >
              {article.cover_image_url && (
                <div className="relative mb-3 aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={article.cover_image_url}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant="purple">{article.category}</Badge>
                {article.source_name && (
                  <Badge variant="blue">via {article.source_name}</Badge>
                )}
              </div>
              <h2 className="font-semibold leading-snug group-hover:text-accent-yellow">
                {article.title}
              </h2>
              {article.excerpt && (
                <p className="mt-2 line-clamp-2 text-sm text-muted">
                  {article.excerpt}
                </p>
              )}
              {article.published_at && (
                <p className="mt-3 text-xs text-muted">
                  {formatDate(article.published_at)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
