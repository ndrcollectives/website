"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/price-tag";
import { useLanguage } from "@/lib/i18n/language-context";

export default function CartPage() {
  const { items, removeItem, setQuantity, subtotalCents } = useCart();
  const { dict } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">{dict.cart.emptyTitle}</h1>
        <p className="mt-2 text-muted">{dict.cart.emptySubtitle}</p>
        <Link href="/shop" className="mt-6 inline-block">
          <Button size="lg">{dict.cart.browseShop}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">{dict.cart.title}</h1>

      <div className="mt-6 grid min-w-0 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl border border-border bg-surface p-4"
            >
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-surface-raised">
                {item.image && (
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/shop/${item.slug}`}
                    className="font-medium hover:text-accent-yellow"
                  >
                    {item.title}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-muted hover:text-accent-red"
                    aria-label={dict.cart.removeItem}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {item.condition && (
                  <p className="text-sm text-muted">{item.condition}</p>
                )}
                <div className="mt-auto flex items-end justify-between">
                  <div className="flex items-center gap-2 rounded-md border border-border">
                    <button
                      className="p-2"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button
                      className="p-2"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <PriceTag
                    cents={item.priceCents * item.quantity}
                    className="items-end"
                    mainClassName="font-semibold text-accent-yellow"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 font-semibold">{dict.cart.orderSummary}</h2>
          <div className="flex items-end justify-between text-sm">
            <span className="text-muted">{dict.cart.subtotal}</span>
            <PriceTag cents={subtotalCents} className="items-end" />
          </div>
          <p className="mt-1 text-xs text-muted">{dict.cart.shippingNote}</p>
          {error && <p className="mt-3 text-sm text-accent-red">{error}</p>}
          <Button
            size="lg"
            className="mt-4 w-full"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? dict.cart.redirecting : dict.cart.checkout}
          </Button>
        </div>
      </div>
    </div>
  );
}
