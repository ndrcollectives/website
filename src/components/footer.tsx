"use client";

import Link from "next/link";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Logomark } from "@/components/logomark";
import { useLanguage } from "@/lib/i18n/language-context";

export function Footer() {
  const { dict } = useLanguage();

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Logomark />
              NDR Collectives
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">{dict.footer.tagline}</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              {dict.footer.shopHeading}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-accent-yellow">{dict.footer.allCards}</Link></li>
              <li><Link href="/shop?product_type=sealed_box" className="hover:text-accent-yellow">{dict.footer.boosterBoxes}</Link></li>
              <li><Link href="/shop?product_type=etb" className="hover:text-accent-yellow">{dict.footer.etbs}</Link></li>
              <li><Link href="/shop?product_type=graded_slab" className="hover:text-accent-yellow">{dict.footer.gradedSlabs}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              {dict.footer.exploreHeading}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sets" className="hover:text-accent-yellow">{dict.footer.releaseCalendar}</Link></li>
              <li><Link href="/news" className="hover:text-accent-yellow">{dict.footer.newsSpoilers}</Link></li>
              <li><Link href="/account/orders" className="hover:text-accent-yellow">{dict.footer.trackOrder}</Link></li>
            </ul>
          </div>

          <NewsletterSignup />
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs text-muted">
          © {new Date().getFullYear()} NDR Collectives. {dict.footer.disclaimer}
        </p>
      </div>
    </footer>
  );
}
