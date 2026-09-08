"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { ShoppingBag, Compass, User, HelpCircle } from "lucide-react";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Logomark } from "@/components/logomark";
import { InstagramIcon, TikTokIcon } from "@/components/social-icons";
import { useLanguage } from "@/lib/i18n/language-context";

const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/ndrcollectives/", label: "Instagram", Icon: InstagramIcon },
  { href: "https://tiktok.com/@ndr.collectives", label: "TikTok", Icon: TikTokIcon },
];

const HEADING_COLORS = {
  yellow: "bg-accent-yellow/15 text-accent-yellow",
  purple: "bg-accent-purple/15 text-accent-purple",
  blue: "bg-accent-blue/15 text-accent-blue",
  red: "bg-accent-red/15 text-accent-red",
} as const;

function ColumnHeading({
  icon: Icon,
  color,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  color: keyof typeof HEADING_COLORS;
  children: React.ReactNode;
}) {
  return (
    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${HEADING_COLORS[color]}`}
      >
        <Icon className="h-3 w-3" />
      </span>
      {children}
    </h4>
  );
}

export function Footer() {
  const { dict } = useLanguage();

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Logomark />
              NDR Collectives
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">{dict.footer.tagline}</p>
            <div className="mt-4 flex items-center gap-2">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent-yellow/50 hover:text-accent-yellow"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <ColumnHeading icon={ShoppingBag} color="yellow">
              {dict.footer.shopHeading}
            </ColumnHeading>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="hover:text-accent-yellow">
                  {dict.footer.allCards}
                </Link>
              </li>
              <li>
                <Link href="/shop?product_type=sealed_box" className="hover:text-accent-yellow">
                  {dict.footer.boosterBoxes}
                </Link>
              </li>
              <li>
                <Link href="/shop?product_type=etb" className="hover:text-accent-yellow">
                  {dict.footer.etbs}
                </Link>
              </li>
              <li>
                <Link href="/shop?product_type=graded_slab" className="hover:text-accent-yellow">
                  {dict.footer.gradedSlabs}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <ColumnHeading icon={Compass} color="purple">
              {dict.footer.exploreHeading}
            </ColumnHeading>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sets" className="hover:text-accent-yellow">
                  {dict.footer.releaseCalendar}
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-accent-yellow">
                  {dict.footer.newsSpoilers}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-accent-yellow">
                  {dict.cookies.manage}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <ColumnHeading icon={User} color="blue">
              {dict.footer.accountHeading}
            </ColumnHeading>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/account" className="hover:text-accent-yellow">
                  {dict.nav.myAccount}
                </Link>
              </li>
              <li>
                <Link href="/account/favorites" className="hover:text-accent-yellow">
                  {dict.nav.favorites}
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-accent-yellow">
                  {dict.footer.trackOrder}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <ColumnHeading icon={HelpCircle} color="red">
              {dict.footer.helpHeading}
            </ColumnHeading>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-accent-yellow">
                  {dict.footer.faq}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@ndrcollectives.com"
                  className="hover:text-accent-yellow"
                >
                  {dict.footer.contactUs}
                </a>
              </li>
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
