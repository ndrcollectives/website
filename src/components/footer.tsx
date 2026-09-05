import Link from "next/link";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Logomark } from "@/components/logomark";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Logomark />
              NDR Collectives
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Pokémon TCG news, release calendar, and a marketplace for
              singles, sealed product, and graded slabs.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              Shop
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-accent-yellow">All Cards</Link></li>
              <li><Link href="/shop?product_type=sealed_box" className="hover:text-accent-yellow">Booster Boxes</Link></li>
              <li><Link href="/shop?product_type=etb" className="hover:text-accent-yellow">Elite Trainer Boxes</Link></li>
              <li><Link href="/shop?product_type=graded_slab" className="hover:text-accent-yellow">Graded Slabs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sets" className="hover:text-accent-yellow">Release Calendar</Link></li>
              <li><Link href="/news" className="hover:text-accent-yellow">News & Spoilers</Link></li>
              <li><Link href="/account/orders" className="hover:text-accent-yellow">Track Order</Link></li>
            </ul>
          </div>

          <NewsletterSignup />
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs text-muted">
          © {new Date().getFullYear()} NDR Collectives. Not affiliated with
          The Pokémon Company, Nintendo, Creatures, or Game Freak.
        </p>
      </div>
    </footer>
  );
}
