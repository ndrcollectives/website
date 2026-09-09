import type { createClient } from "@/lib/supabase/server";
import type { createAdminClient } from "@/lib/supabase/admin";

export type CheckoutLineInput = { productId: string; quantity: number };

export type ValidatedLine = {
  productId: string;
  title: string;
  image: string | null;
  unitAmountCents: number;
  quantity: number;
};

type SupabaseLike = Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createAdminClient>;

// Shared by every payment provider's checkout route — never trust
// client-submitted prices/stock, always re-price and re-validate against
// the database right before creating a provider order/session.
export async function validateCartItems(
  supabase: SupabaseLike,
  items: CheckoutLineInput[],
): Promise<{ lines: ValidatedLine[] } | { error: string }> {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Cart is empty" };
  }

  const productIds = items.map((i) => i.productId);
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  if (error || !products || products.length === 0) {
    return { error: "Unable to load products" };
  }

  const lines: ValidatedLine[] = [];
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return { error: `Product ${item.productId} no longer exists` };
    }
    if (!product.is_preorder && product.inventory_count < item.quantity) {
      return { error: `Not enough stock for "${product.title}"` };
    }
    lines.push({
      productId: product.id,
      title: product.title,
      image: product.images?.[0] ?? null,
      unitAmountCents: product.price_cents,
      quantity: item.quantity,
    });
  }

  return { lines };
}

export function subtotalCentsOf(lines: ValidatedLine[]): number {
  return lines.reduce((sum, l) => sum + l.unitAmountCents * l.quantity, 0);
}
