"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getSuggestedPriceCents } from "@/lib/default-prices";
import { createProductFromCard } from "@/app/admin/products/actions";

const VARIANTS = ["Normal", "Reverse Holofoil", "Holofoil", "1st Edition"];

export function QuickListingForm({
  setId,
  cardNumber,
  cardName,
  rarity,
  image,
}: {
  setId: string;
  cardNumber: string;
  cardName: string;
  rarity: string | null;
  image: string | null;
}) {
  const [variant, setVariant] = useState("Normal");
  const [priceTouched, setPriceTouched] = useState(false);
  const [price, setPrice] = useState(() =>
    (getSuggestedPriceCents(rarity, "Normal") / 100).toFixed(2),
  );

  function handleVariantChange(next: string) {
    setVariant(next);
    if (!priceTouched) {
      setPrice((getSuggestedPriceCents(rarity, next) / 100).toFixed(2));
    }
  }

  return (
    <form action={createProductFromCard} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="set_id" value={setId} />
      <input type="hidden" name="card_number" value={cardNumber} />
      <input type="hidden" name="card_name" value={cardName} />
      <input type="hidden" name="rarity" value={rarity ?? ""} />
      <input type="hidden" name="image" value={image ?? ""} />
      <Select
        name="variant"
        value={variant}
        onChange={(e) => handleVariantChange(e.target.value)}
        className="h-9 w-40"
      >
        {VARIANTS.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </Select>
      <Input
        name="price"
        type="number"
        step="0.01"
        placeholder="Price (€)"
        required
        value={price}
        onChange={(e) => {
          setPriceTouched(true);
          setPrice(e.target.value);
        }}
        className="h-9 w-24"
      />
      <Input name="quantity" type="number" placeholder="Qty" required className="h-9 w-20" />
      <Button size="sm" type="submit">
        Add Listing
      </Button>
    </form>
  );
}
