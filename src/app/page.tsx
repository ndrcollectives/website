import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { CountdownTimer } from "@/components/countdown-timer";
import {
  getFeaturedProducts,
  getPublishedArticles,
  getUpcomingSets,
} from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const [sets, products, articles] = await Promise.all([
    getUpcomingSets(4),
    getFeaturedProducts(8),
    getPublishedArticles(undefined, 3),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-accent-purple/10 p-8 md:p-14">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Chase the{" "}
            <span className="bg-gradient-to-r from-accent-yellow via-accent-red to-accent-purple bg-clip-text text-transparent">
              next big pull
            </span>
          </h1>
          <p className="mt-4 max-w-lg text-muted md:text-lg">
            Breaking Pokémon TCG news, a live set release calendar, and a
            curated marketplace of singles, sealed product, and graded slabs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="inline-flex">
              <Button size="lg">
                Shop Latest Cards <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sets" className="inline-flex">
              <Button size="lg" variant="secondary">
                View Sets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming sets ticker */}
      {sets.length > 0 && (
        <section className="mt-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <CalendarClock className="h-5 w-5 text-accent-blue" />
              Upcoming Set Releases
            </h2>
            <Link href="/sets" className="text-sm text-accent-blue hover:underline">
              Full calendar
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sets.map((set) => (
              <Link
                key={set.id}
                href={`/sets#${set.code}`}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent-blue/60"
              >
                <div className="relative h-16 w-full">
                  {set.logo_url ? (
                    <Image
                      src={set.logo_url}
                      alt={set.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold">
                      {set.name}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted">{formatDate(set.release_date)}</p>
                <CountdownTimer releaseDate={set.release_date} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending products */}
      {products.length > 0 && (
        <section className="mt-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Trending Singles & Featured Boxes</h2>
            <Link href="/shop" className="text-sm text-accent-blue hover:underline">
              Browse shop
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Latest articles */}
      {articles.length > 0 && (
        <section className="mt-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Latest Articles</h2>
            <Link href="/news" className="text-sm text-accent-blue hover:underline">
              All news
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent-yellow/50"
              >
                {article.cover_image_url && (
                  <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-surface-raised p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.cover_image_url}
                      alt={article.title}
                      className="max-h-full w-auto max-w-full transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <Badge variant="purple" className="mb-2">
                  {article.category}
                </Badge>
                <h3 className="font-semibold leading-snug group-hover:text-accent-yellow">
                  {article.title}
                </h3>
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
        </section>
      )}
    </div>
  );
}
