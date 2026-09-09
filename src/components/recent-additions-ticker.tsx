"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { PriceTag } from "@/components/price-tag";
import type { Product } from "@/lib/types";

// Roughly matches the previous CSS marquee's pace (40s to scroll one full
// copy of the track at a typical card width) without depending on how
// wide the track actually ends up.
const SPEED_PX_PER_SEC = 32;
// How long to hold off resuming auto-scroll after the visitor lets go —
// long enough to actually look at whatever card scrolled up to them.
const RESUME_DELAY_MS = 2500;

// Auto-scrolls right-to-left through recently added products, but unlike
// a CSS transform animation, this drives real scrollLeft on a normal
// scroll container — so a visitor can grab it (mouse drag, touch swipe,
// trackpad, wheel) at any point to stop and look at a card, and it picks
// back up on its own shortly after they let go, instead of the strip
// being either non-interactive (transform-animated) or only interactive
// (plain scroll, no auto-advance).
export function RecentAdditionsTicker({ products }: { products: Product[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame: number;
    let last = performance.now();

    function step(now: number) {
      const el = viewportRef.current;
      const dt = now - last;
      last = now;
      if (el && !pausedRef.current) {
        el.scrollLeft += (SPEED_PX_PER_SEC * dt) / 1000;
        // The track renders the product list twice back to back, so once
        // we've scrolled past the first copy, jumping back by exactly
        // that width lines the second copy up invisibly — a seamless
        // loop with no visible reset.
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  function pause() {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }

  function scheduleResume() {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY_MS);
  }

  if (products.length === 0) return null;

  const track = [...products, ...products];

  return (
    <div
      ref={viewportRef}
      className="marquee-viewport flex gap-4 overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
      onPointerDown={pause}
      onPointerUp={scheduleResume}
      onPointerCancel={scheduleResume}
      onPointerLeave={(e) => {
        // A real mouse leaving mid-drag also needs to schedule a resume —
        // pointerup won't fire outside the element in that case.
        if (e.pointerType === "mouse" && pausedRef.current) scheduleResume();
      }}
      onScroll={() => {
        // Only a user-driven scroll (touch/trackpad/wheel momentum) lands
        // here while paused — our own auto-scroll never runs while
        // pausedRef is true — so this just keeps pushing the resume
        // timer out for as long as that motion continues.
        if (pausedRef.current) scheduleResume();
      }}
    >
      {track.map((product, i) => (
        <Link
          key={`${product.id}-${i}`}
          href={`/shop/${product.slug}`}
          className="flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent-yellow/50"
        >
          <div className="relative aspect-[5/7] bg-surface-raised">
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
  );
}
