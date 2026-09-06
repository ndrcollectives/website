"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { buttonVariants } from "@/components/ui/button";
import { PriceTag } from "@/components/price-tag";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQuantity, subtotalCents } =
    useCart();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={closeCart}
          aria-hidden
        />
      )}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform border-l border-border bg-surface transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <ShoppingBag className="h-5 w-5 text-accent-yellow" />
            Your Cart
          </h2>
          <button onClick={closeCart} aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(100%-8.5rem)] flex-col gap-4 overflow-y-auto p-4">
          {items.length === 0 && (
            <p className="mt-8 text-center text-sm text-muted">
              Your cart is empty. Go find some heaters.
            </p>
          )}
          {items.map((item) => (
            <div key={item.productId} className="flex gap-3">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-surface-raised">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight">
                    {item.title}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-muted hover:text-accent-red"
                    aria-label="Remove item"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {item.condition && (
                  <p className="text-xs text-muted">{item.condition}</p>
                )}
                <div className="mt-auto flex items-end justify-between">
                  <div className="flex items-center gap-2 rounded-md border border-border">
                    <button
                      className="p-1"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center text-xs">
                      {item.quantity}
                    </span>
                    <button
                      className="p-1"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <PriceTag
                    cents={item.priceCents * item.quantity}
                    className="items-end"
                    mainClassName="text-sm font-semibold text-accent-yellow"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 w-full border-t border-border p-4">
          <div className="mb-3 flex items-end justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <PriceTag cents={subtotalCents} className="items-end" mainClassName="font-semibold" />
          </div>
          <Link
            href="/cart"
            onClick={closeCart}
            aria-disabled={items.length === 0}
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full",
              items.length === 0 && "pointer-events-none opacity-50",
            )}
          >
            View Cart & Checkout
          </Link>
        </div>
      </aside>
    </>
  );
}
