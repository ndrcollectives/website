"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const image = product.images?.[0] ?? null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent-yellow/50">
      <Link href={`/shop/${product.slug}`} className="holo-card relative block aspect-[3/4] bg-surface-raised">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-3"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">
            No image
          </div>
        )}
        {product.is_preorder && (
          <Badge variant="blue" className="absolute left-2 top-2">
            Pre-order
          </Badge>
        )}
        {product.inventory_count <= 3 && !product.is_preorder && product.inventory_count > 0 && (
          <Badge variant="red" className="absolute left-2 top-2">
            Only {product.inventory_count} left
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.rarity && <RarityBadge rarity={product.rarity} className="w-fit" />}
        <Link href={`/shop/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug hover:text-accent-yellow">
            {product.title}
          </h3>
        </Link>
        {product.card_number && (
          <p className="text-xs text-muted">#{product.card_number}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="font-bold text-accent-yellow">
              {formatPrice(product.price_cents)}
            </span>
            {product.compare_at_price_cents && (
              <span className="text-xs text-muted line-through">
                {formatPrice(product.compare_at_price_cents)}
              </span>
            )}
          </div>
          <button
            aria-label="Add to cart"
            disabled={product.inventory_count === 0 && !product.is_preorder}
            onClick={() =>
              addItem({
                productId: product.id,
                slug: product.slug,
                title: product.title,
                image,
                priceCents: product.price_cents,
                quantity: 1,
                condition: product.condition,
                maxQuantity: Math.max(product.inventory_count, 1),
              })
            }
            className="rounded-lg bg-surface-raised p-2 text-foreground transition-colors hover:bg-accent-yellow hover:text-slate-950 disabled:pointer-events-none disabled:opacity-40"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
