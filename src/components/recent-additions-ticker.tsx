import Link from "next/link";
import Image from "next/image";
import { PriceTag } from "@/components/price-tag";
import type { Product } from "@/lib/types";

// Continuous right-to-left marquee of recently added products. The track
// renders the list twice back to back and animates it left by exactly
// half its width (see .marquee-track in globals.css) — since both halves
// are identical, the loop point is invisible.
export function RecentAdditionsTicker({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  const track = [...products, ...products];

  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <div className="marquee-track flex w-max gap-4">
        {track.map((product, i) => (
          <Link
            key={`${product.id}-${i}`}
            href={`/shop/${product.slug}`}
            className="flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent-yellow/50"
          >
            <div className="relative aspect-[3/4] bg-surface-raised">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  sizes="144px"
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-col gap-0.5 p-2">
              <p className="line-clamp-1 text-xs font-medium">{product.title}</p>
              <PriceTag cents={product.price_cents} mainClassName="text-xs font-bold text-accent-yellow" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
