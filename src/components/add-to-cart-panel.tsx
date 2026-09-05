"use client";

import { useState } from "react";
import { ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export function AddToCartPanel({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const inStock = product.inventory_count > 0 || product.is_preorder;
  const image = product.images?.[0] ?? null;

  function buildItem() {
    return {
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image,
      priceCents: product.price_cents,
      quantity,
      condition: product.condition,
      maxQuantity: Math.max(product.inventory_count, 1),
    };
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted">Qty</label>
        <div className="flex items-center rounded-lg border border-border">
          <button
            className="px-3 py-1"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            -
          </button>
          <span className="w-8 text-center">{quantity}</span>
          <button
            className="px-3 py-1"
            onClick={() =>
              setQuantity((q) => Math.min(q + 1, Math.max(product.inventory_count, 1)))
            }
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          size="lg"
          variant="secondary"
          className="flex-1"
          disabled={!inStock}
          onClick={() => {
            addItem(buildItem());
            openCart();
          }}
        >
          <ShoppingCart className="h-4 w-4" /> Add to Cart
        </Button>
        <Button
          size="lg"
          className="flex-1"
          disabled={!inStock}
          onClick={() => {
            addItem(buildItem());
            router.push("/cart");
          }}
        >
          <Zap className="h-4 w-4" /> Buy Now
        </Button>
      </div>
    </div>
  );
}
