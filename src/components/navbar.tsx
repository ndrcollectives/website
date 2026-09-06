"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ChevronRight,
  Menu,
  Newspaper,
  Search,
  ShoppingBag,
  ShoppingCart,
  Layers,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-context";
import { Input } from "@/components/ui/input";
import { Logomark } from "@/components/logomark";
import { SettingsMenu } from "@/components/settings-menu";
import { useCardSuggestions, type CardSuggestion } from "@/hooks/use-card-suggestions";
import { useLanguage } from "@/lib/i18n/language-context";

function SearchBox({
  formClassName,
  query,
  onQueryChange,
  onSubmit,
  suggestions,
  onSelectSuggestion,
  placeholder,
  autoFocus,
}: {
  formClassName: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  suggestions: CardSuggestion[];
  onSelectSuggestion: (card: CardSuggestion) => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <form onSubmit={onSubmit} className={formClassName}>
      <div ref={containerRef} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-9"
          autoComplete="off"
          autoFocus={autoFocus}
        />
        {showSuggestions && query.trim().length >= 2 && suggestions.length > 0 && (
          <ul className="absolute z-40 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-surface-raised shadow-lg">
            {suggestions.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSuggestions(false);
                    onSelectSuggestion(card);
                  }}
                  className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-surface"
                >
                  <span className="text-sm font-medium">{card.name}</span>
                  <span className="text-xs text-muted">
                    #{card.number}
                    {card.set ? ` · ${card.set.name}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}

export function Navbar({ isSignedIn }: { isSignedIn: boolean }) {
  const { itemCount, openCart } = useCart();
  const { dict } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const suggestions = useCardSuggestions(query);

  const NAV_LINKS = [
    { href: "/shop", label: dict.nav.shop, icon: ShoppingBag },
    { href: "/sets", label: dict.nav.sets, icon: Layers },
    { href: "/news", label: dict.nav.news, icon: Newspaper },
  ];

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
    }
  }

  function selectSuggestion(card: CardSuggestion) {
    setQuery(card.name);
    const target = card.set
      ? `/shop?search=${encodeURIComponent(card.name)}&set=${card.set.id}`
      : `/shop?search=${encodeURIComponent(card.name)}`;
    router.push(target);
    setSearchOpen(false);
  }

  return (
    <>
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <button
          className="shrink-0 rounded-lg p-2 hover:bg-surface-raised md:hidden"
          onClick={() => {
            setMobileOpen((v) => !v);
            setSearchOpen(false);
          }}
          aria-label={dict.nav.toggleMenu}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Centered in the remaining space on mobile (rather than
            viewport-absolute) so the wordmark shrinks/truncates gracefully
            on narrow screens; pinned left of the search bar on desktop. */}
        <div className="flex min-w-0 flex-1 justify-center md:flex-none md:justify-start">
          <Link href="/" className="flex min-w-0 items-center gap-2 font-bold">
            <Logomark className="shrink-0" />
            <span className="truncate text-sm sm:text-base">NDR Collectives</span>
          </Link>
        </div>

        {/* Desktop: search is always visible in the header, not a toggle
            (mobile keeps the toggle below — narrow screens don't have room
            for a persistent bar). */}
        <div className="hidden min-w-0 md:flex md:flex-1">
          <SearchBox
            formClassName="w-full"
            query={query}
            onQueryChange={setQuery}
            onSubmit={handleSearch}
            suggestions={suggestions}
            onSelectSuggestion={selectSuggestion}
            placeholder={dict.nav.searchPlaceholder}
          />
        </div>

        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <button
            onClick={() => {
              setSearchOpen((v) => !v);
              setMobileOpen(false);
            }}
            className="rounded-lg p-2 hover:bg-surface-raised"
            aria-label={dict.nav.search}
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={openCart}
            className="relative rounded-lg p-2 hover:bg-surface-raised"
            aria-label={dict.nav.openCart}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-yellow px-1 text-[10px] font-bold text-slate-950">
                {itemCount}
              </span>
            )}
          </button>
          <SettingsMenu />
        </div>

        <div className="hidden shrink-0 items-center gap-1 md:flex">
          <Link
            href={isSignedIn ? "/account" : "/sign-in"}
            className="rounded-lg p-2 hover:bg-surface-raised"
            aria-label={dict.nav.account}
          >
            <User className="h-5 w-5" />
          </Link>
          <button
            onClick={openCart}
            className="relative rounded-lg p-2 hover:bg-surface-raised"
            aria-label={dict.nav.openCart}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-yellow px-1 text-[10px] font-bold text-slate-950">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border p-4 md:hidden">
          <SearchBox
            formClassName="mx-auto max-w-2xl"
            query={query}
            onQueryChange={setQuery}
            onSubmit={handleSearch}
            suggestions={suggestions}
            onSelectSuggestion={selectSuggestion}
            placeholder={dict.nav.searchPlaceholder}
            autoFocus
          />
        </div>
      )}

      {/* Desktop-only secondary row: nav links on the left (category-row
          style, like the reference layout), settings on the right — mobile
          gets these via the burger drawer and its own gear button instead. */}
      <div className="hidden border-t border-border md:block">
        <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-4">
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground",
                    active && "text-foreground",
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <SettingsMenu />
        </div>
      </div>
    </header>

    {/* Rendered outside <header> — that element's backdrop-blur creates a
        containing block for `fixed` descendants in some browsers, which
        would trap this drawer inside the 64px header bar instead of the
        viewport (the same reason CartDrawer is a top-level sibling, not
        nested inside Navbar). */}
    {mobileOpen && (
      <div
        className="fixed inset-0 z-40 bg-black/60 md:hidden"
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
    )}
    <aside
      className={`fixed left-0 top-0 z-50 h-full w-64 max-w-[80vw] transform border-r border-border bg-surface transition-transform duration-300 md:hidden ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border p-4">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 font-bold"
        >
          <Logomark />
          <span className="text-sm">NDR Collectives</span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-2 hover:bg-surface-raised"
          aria-label={dict.nav.toggleMenu}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto p-3">
        <Link
          href={isSignedIn ? "/account" : "/sign-in"}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-xl bg-surface-raised px-3 py-3 hover:bg-surface-raised/70"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background">
            <User className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold">
            {isSignedIn ? dict.nav.myAccount : dict.nav.signIn}
          </span>
          <ChevronRight className="ml-auto h-4 w-4 text-muted" />
        </Link>

        <nav className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
            {dict.footer.exploreHeading}
          </p>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface-raised",
                  active && "bg-surface-raised",
                )}
              >
                <link.icon className="h-4 w-4 text-muted" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
    </>
  );
}
