"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCardSuggestions, type CardSuggestion } from "@/hooks/use-card-suggestions";
import { VARIANT_ORDER } from "@/lib/product-variant";
import { getSuggestedPriceCents } from "@/lib/default-prices";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { addBinderItem } from "@/app/account/binder/actions";

const CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"];

// Adds a card to a binder — search the synced catalog (same source as the
// shop's own search), pick a printed card, then variant/condition/quantity.
// Submits straight to the addBinderItem server action; no client-side
// pricing round trip since getSuggestedPriceCents is a pure lookup.
export function AddBinderItemForm({ binderId }: { binderId: string }) {
  const { dict } = useLanguage();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selected, setSelected] = useState<CardSuggestion | null>(null);
  const [variant, setVariant] = useState<string>(VARIANT_ORDER[0]);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestions = useCardSuggestions(query);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectCard(card: CardSuggestion) {
    setSelected(card);
    setQuery(card.name);
    setShowSuggestions(false);
    setVariant(VARIANT_ORDER[0]);
  }

  const estimatedCents = selected
    ? getSuggestedPriceCents(selected.rarity, variant)
    : null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold">{dict.binder.addCard}</h3>

      <div ref={containerRef} className="relative mt-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={dict.binder.searchPlaceholder}
          className="pl-9"
          autoComplete="off"
        />
        {showSuggestions && query.trim().length >= 2 && suggestions.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-surface-raised shadow-lg">
            {suggestions.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => selectCard(card)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-surface"
                >
                  <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded bg-surface">
                    {card.image_small && (
                      <Image src={card.image_small} alt={card.name} fill className="object-contain" />
                    )}
                  </div>
                  <span>
                    <span className="block text-sm font-medium">{card.name}</span>
                    <span className="block text-xs text-muted">
                      #{card.number}
                      {card.set ? ` · ${card.set.name}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <form action={addBinderItem} className="mt-3 space-y-3">
          <input type="hidden" name="binder_id" value={binderId} />
          <input type="hidden" name="card_id" value={selected.id} />

          <div className="flex items-center gap-3 rounded-lg bg-surface-raised p-2">
            <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-surface">
              {selected.image_small && (
                <Image
                  src={selected.image_small}
                  alt={selected.name}
                  fill
                  className="object-contain"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{selected.name}</p>
              <p className="text-xs text-muted">
                #{selected.number}
                {selected.set ? ` · ${selected.set.name}` : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-muted">{dict.binder.variant}</label>
              <Select
                name="variant"
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
              >
                {VARIANT_ORDER.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">{dict.binder.condition}</label>
              <Select name="condition" defaultValue="NM">
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted">{dict.binder.quantity}</label>
              <Input name="quantity" type="number" min={1} defaultValue={1} />
            </div>
            <Button type="submit">{dict.binder.addToBinder}</Button>
          </div>

          {estimatedCents != null && (
            <p className="text-xs text-muted">
              {dict.binder.estimatedValueEach.replace("{price}", formatPrice(estimatedCents))}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
