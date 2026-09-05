import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { getArticleBySlug, getFeaturedProducts } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: "article",
      publishedTime: article.published_at ?? undefined,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [article, relatedProducts] = await Promise.all([
    getArticleBySlug(slug),
    getFeaturedProducts(4),
  ]);

  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.cover_image_url ? [article.cover_image_url] : undefined,
    datePublished: article.published_at,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-6 text-sm text-muted">
        <Link href="/news" className="hover:text-accent-yellow">
          News
        </Link>{" "}
        / <span>{article.category}</span>
      </nav>

      <Badge variant="purple">{article.category}</Badge>
      <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">
        {article.title}
      </h1>
      {article.published_at && (
        <p className="mt-2 text-sm text-muted">
          {formatDate(article.published_at)}
        </p>
      )}

      {article.cover_image_url && (
        <div className="mt-6 flex items-center justify-center overflow-hidden rounded-xl bg-surface-raised p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="max-h-96 w-auto max-w-full"
          />
        </div>
      )}

      <div className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-foreground">
        {article.content}
      </div>

      {article.source_url && (
        <a
          href={article.source_url}
          target="_blank"
          rel="noreferrer"
          className="mt-6 flex items-center justify-between rounded-xl border border-border bg-surface p-4 text-sm hover:border-accent-blue/60"
        >
          <span>
            Aggregated from{" "}
            <span className="font-semibold text-accent-blue">
              {article.source_name}
            </span>
            . Read the full story there.
          </span>
          <span className="text-accent-blue">&rarr;</span>
        </a>
      )}

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-xl font-bold">Shop the Set</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
