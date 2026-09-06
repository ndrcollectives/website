"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
        method="get"
        className={cn("space-y-5 lg:mt-0 lg:block", open ? "mt-4 block" : "hidden")}
      >
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-muted">
            Search
          </label>
          <Input name="search" defaultValue={params.search} placeholder="Charizard 004/102" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-muted">
            Set / Expansion
          </label>
          <Select name="set" defaultValue={params.set ?? ""}>
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
