import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { HoloCard } from "@/components/holo-card";
import { AddToCartPanel } from "@/components/add-to-cart-panel";
import { PriceTag } from "@/components/price-tag";
import { FavoriteButton } from "@/components/favorite-button";
import { getFavoriteProductIds, getProductBySlug } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.title,
    description: product.description ?? undefined,
    openGraph: {
      title: product.title,
      description: product.description ?? undefined,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, favoriteIds] = await Promise.all([
    getProductBySlug(slug),
    getFavoriteProductIds(),
  ]);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images,
    description: product.description,
    sku: product.id,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (product.price_cents / 100).toFixed(2),
      availability:
        product.inventory_count > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: "/shop" },
      { "@type": "ListItem", position: 2, name: product.title },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <nav className="mb-6 text-sm text-muted">
        <Link href="/shop" className="hover:text-accent-yellow">
          Shop
        </Link>{" "}
        / <span>{product.title}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="mx-auto w-full max-w-sm">
            {product.images?.[0] ? (
              <HoloCard
                src={product.images[0]}
                alt={product.title}
                className="aspect-[3/4] w-full"
                priority
              />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-surface-raised text-muted">
                No image available
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-thin">
              {product.images.slice(1).map((img, i) => (
                <div
                  key={i}
                  className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-surface-raised"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-3">
            {product.rarity ? <RarityBadge rarity={product.rarity} /> : <span />}
            <FavoriteButton
              productId={product.id}
              initialFavorited={favoriteIds.has(product.id)}
              className="border border-border"
            />
          </div>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight">
            {product.title}
          </h1>
          {product.set && (
            <p className="mt-1 text-sm text-muted">
              {product.set.name} &middot; #{product.card_number}
            </p>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <PriceTag
              cents={product.price_cents}
              mainClassName="text-3xl font-bold text-accent-yellow"
              eurClassName="text-sm"
            />
            {product.compare_at_price_cents && (
              <span className="text-lg text-muted line-through">
                {formatPrice(product.compare_at_price_cents)}
              </span>
            )}
          </div>

          <div className="mt-2 text-sm">
            {product.is_preorder ? (
              <span className="text-accent-blue">Available for pre-order</span>
            ) : product.inventory_count > 0 ? (
              <span className="text-accent-yellow">
                In Stock {product.inventory_count <= 5 && `— only ${product.inventory_count} left`}
              </span>
            ) : (
              <span className="text-accent-red">Out of stock</span>
            )}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4 text-sm">
            {product.condition && (
              <div>
                <dt className="text-muted">Condition</dt>
                <dd className="font-medium">{product.condition}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted">Type</dt>
              <dd className="font-medium capitalize">
                {product.product_type.replace("_", " ")}
              </dd>
            </div>
            {product.set && (
              <div>
                <dt className="text-muted">Set</dt>
                <dd className="font-medium">{product.set.name}</dd>
              </div>
            )}
            {product.card_number && (
              <div>
                <dt className="text-muted">Card Number</dt>
                <dd className="font-medium">{product.card_number}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6">
            <AddToCartPanel product={product} />
          </div>

          {product.description && (
            <div className="mt-8">
              <h2 className="mb-2 font-semibold">Description</h2>
              <p className="whitespace-pre-wrap text-sm text-muted">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
