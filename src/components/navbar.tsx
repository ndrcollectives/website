"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Menu, Search, ShoppingCart, User, X } from "lucide-react";
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
  const suggestions = useCardSuggestions(query);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  const NAV_LINKS = [
    { href: "/shop", label: dict.nav.shop },
    { href: "/sets", label: dict.nav.sets },
    { href: "/news", label: dict.nav.news },
  ];

  useEffect(() => {
    if (!mobileOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        !mobileToggleRef.current?.contains(target)
      ) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

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
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-2 px-4">
        <div className="flex shrink-0 items-center gap-6">
          <button
            ref={mobileToggleRef}
            className="rounded-lg p-2 hover:bg-surface-raised md:hidden"
            onClick={() => {
              setMobileOpen((v) => !v);
              setSearchOpen(false);
            }}
            aria-label={dict.nav.toggleMenu}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

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
        </div>

        {/* Centered in the space between the left and right zones (rather
            than viewport-absolute) so the wordmark shrinks/truncates
            gracefully on narrow screens instead of having to be hidden. */}
        <div className="flex min-w-0 flex-1 justify-center">
          <Link href="/" className="flex min-w-0 items-center gap-2 font-bold">
            <Logomark className="shrink-0" />
            <span className="truncate text-sm sm:text-base">NDR Collectives</span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1">
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
          <Link
            href={isSignedIn ? "/account" : "/sign-in"}
            className="hidden rounded-lg p-2 hover:bg-surface-raised md:block"
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
          <SettingsMenu />
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border p-4">
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

      {mobileOpen && (
        <nav
          ref={mobileMenuRef}
          className="absolute left-4 top-full z-40 mt-2 flex max-w-[calc(100vw-2rem)] flex-wrap gap-2 rounded-lg border border-border bg-surface-raised/95 p-3 shadow-lg backdrop-blur-xl md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-accent-yellow/60 hover:bg-surface"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={isSignedIn ? "/account" : "/sign-in"}
            onClick={() => setMobileOpen(false)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-accent-yellow/60 hover:bg-surface"
          >
            {isSignedIn ? dict.nav.myAccount : dict.nav.signIn}
          </Link>
        </nav>
      )}
    </header>
  );
}
