"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { Input } from "@/components/ui/input";
import { Logomark } from "@/components/logomark";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/sets", label: "Sets" },
  { href: "/news", label: "News" },
];

export function Navbar({ isSignedIn }: { isSignedIn: boolean }) {
  const { itemCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      setMobileOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Logomark />
          <span className="hidden sm:inline">NDR Collectives</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="ml-auto hidden max-w-sm flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cards, sets, numbers..."
              className="pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href={isSignedIn ? "/account" : "/sign-in"}
            className="hidden rounded-lg p-2 hover:bg-surface-raised md:block"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          <button
            onClick={openCart}
            className="relative rounded-lg p-2 hover:bg-surface-raised"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-yellow px-1 text-[10px] font-bold text-slate-950">
                {itemCount}
              </span>
            )}
          </button>
          <button
            className="rounded-lg p-2 hover:bg-surface-raised md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border p-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cards, sets, numbers..."
                className="pl-9"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={isSignedIn ? "/account" : "/sign-in"}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-muted hover:text-foreground"
            >
              {isSignedIn ? "My Account" : "Sign In"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
