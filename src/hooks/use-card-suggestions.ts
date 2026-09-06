"use client";

import { useEffect, useState } from "react";

export type CardSuggestion = {
  id: string;
  name: string;
  number: string;
  set: { id: string; name: string; code: string } | null;
};

// Debounced autocomplete against /api/cards/search — shared by the navbar
// search box and the shop's filter search so both suggest from the same
// synced card catalog instead of duplicating the fetch/debounce logic.
export function useCardSuggestions(query: string, setId?: string): CardSuggestion[] {
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      const url = new URL("/api/cards/search", window.location.origin);
      url.searchParams.set("q", q);
      if (setId) url.searchParams.set("set", setId);

      fetch(url, { signal: controller.signal })
        .then((res) => res.json())
        .then((body: { results: CardSuggestion[] }) => setSuggestions(body.results ?? []))
        .catch(() => {});
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, setId]);

  return suggestions;
}
