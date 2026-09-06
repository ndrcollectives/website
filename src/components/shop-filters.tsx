"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCardSuggestions, type CardSuggestion } from "@/hooks/use-card-suggestions";
import type { Set } from "@/lib/types";

const PRODUCT_TYPES = [
  { value: "single", label: "Single" },
  { value: "sealed_box", label: "Booster Box" },
  { value: "etb", label: "Elite Trainer Box" },
  { value: "pack", label: "Booster Pack" },
  { value: "graded_slab", label: "Graded Card / Slab" },
];

const RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Holo Rare",
  "Ultra Rare",
  "Illustration Rare",
  "Special Illustration Rare",
  "Secret Illustration Rare",
  "Hyper Rare",
];

const CONDITIONS = ["M", "NM", "LP", "MP", "HP", "DMG"];

type SearchParams = Record<string, string | undefined>;

export function ShopFilters({ sets, params }: { sets: Set[]; params: SearchParams }) {
  // Filters stay collapsed by default on phones/tablets so visitors see
  // products right away instead of scrolling past a long form first; at
  // `lg` and up they're always visible regardless of this toggle.
  const [open, setOpen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const setSelectRef = useRef<HTMLSelectElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(params.search ?? "");
  const [selectedSetId, setSelectedSetId] = useState(params.set ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Keep the box in sync if the URL's search/set params change from
  // outside this component (browser back/forward, a link elsewhere
  // setting them). Adjusting state during render (React's documented
  // pattern for this, rather than an effect) avoids an extra commit on
  // every keystroke.
  const [syncedSearchParam, setSyncedSearchParam] = useState(params.search);
  if (params.search !== syncedSearchParam) {
    setSyncedSearchParam(params.search);
    setQuery(params.search ?? "");
  }
  const [syncedSetParam, setSyncedSetParam] = useState(params.set);
  if (params.set !== syncedSetParam) {
    setSyncedSetParam(params.set);
    setSelectedSetId(params.set ?? "");
  }

  // Suggest cards (not products — the card catalog has full official
  // names/numbers/sets even for cards nobody has listed yet) as the admin
  // types, scoped to the currently selected set so "cha" in Chaos Rising
  // resolves to that set's Charizard and number instead of every printing.
  const suggestions = useCardSuggestions(query, selectedSetId || undefined);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(card: CardSuggestion) {
    setQuery(card.name);
    setShowSuggestions(false);
    if (card.set) {
      setSelectedSetId(card.set.id);
      if (setSelectRef.current) setSelectRef.current.value = card.set.id;
    }
    // Let the controlled input's new value flush before the GET submit
    // reads it off the form.
    requestAnimationFrame(() => formRef.current?.requestSubmit());
  }

  return (
    <div className="h-fit rounded-xl border border-border bg-surface p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-sm font-semibold lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <form
        ref={formRef}
        method="get"
        className={cn("space-y-5 lg:mt-0 lg:block", open ? "mt-4 block" : "hidden")}
      >
        <div ref={searchBoxRef} className="relative">
          <label className="mb-1 block text-xs font-semibold uppercase text-muted">
            Search
          </label>
          <Input
            name="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Charizard 004/102"
            autoComplete="off"
          />
          {showSuggestions && query.trim().length >= 2 && suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-surface-raised shadow-lg">
              {suggestions.map((card) => (
                <li key={card.id}>
                  <button
                    type="button"
                    onClick={() => selectSuggestion(card)}
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-surface"
                  >
                    <span className="text-sm font-medium">{card.name}</span>
                    <span className="text-xs text-muted">
                      #{card.number}
                      {card.set && !selectedSetId ? ` · ${card.set.name}` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-muted">
            Set / Expansion
          </label>
          <Select
            name="set"
            ref={setSelectRef}
            defaultValue={params.set ?? ""}
            onChange={(e) => setSelectedSetId(e.target.value)}
          >
            <option value="">All sets</option>
            {sets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-muted">
            Card Type
          </label>
          <Select name="product_type" defaultValue={params.product_type ?? ""}>
            <option value="">All types</option>
            {PRODUCT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-muted">
            Rarity
          </label>
          <Select name="rarity" defaultValue={params.rarity ?? ""}>
            <option value="">All rarities</option>
            {RARITIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-muted">
            Condition
          </label>
          <Select name="condition" defaultValue={params.condition ?? ""}>
            <option value="">Any condition</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-muted">
            Price ($)
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              name="min_price"
              min={0}
              defaultValue={params.min_price}
              placeholder="Min"
            />
            <Input
              type="number"
              name="max_price"
              min={0}
              defaultValue={params.max_price}
              placeholder="Max"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-muted">
            Sort By
          </label>
          <Select name="sort" defaultValue={params.sort ?? "newest"}>
            <option value="newest">Newest Added</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="card_number">Set Number</option>
          </Select>
        </div>

        <Button type="submit" className="w-full">
          Apply Filters
        </Button>
      </form>
    </div>
  );
}
