export type UserRole = "customer" | "admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};

export type Set = {
  id: string;
  name: string;
  code: string;
  era: string;
  release_date: string;
  total_cards: number;
  logo_url: string | null;
  banner_url: string | null;
  is_upcoming: boolean;
  created_at: string;
};

export type Card = {
  id: string;
  set_id: string;
  api_id: string;
  name: string;
  number: string;
  rarity: string | null;
  supertype: string | null;
  image_small: string | null;
  image_large: string | null;
  artist: string | null;
  created_at: string;
};

export type ProductType =
  | "single"
  | "sealed_box"
  | "etb"
  | "pack"
  | "graded_slab";

export type Condition =
  | "M"
  | "NM"
  | "LP"
  | "MP"
  | "HP"
  | "DMG"
  | "Graded_PSA10"
  | "Graded_PSA9"
  | "Graded_BGS10"
  | "Graded_CGC10";

export type Rarity =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Holo Rare"
  | "Ultra Rare"
  | "Illustration Rare"
  | "Special Illustration Rare"
  | "Secret Illustration Rare"
  | "Hyper Rare";

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  product_type: ProductType;
  set_id: string | null;
  set?: Set | null;
  card_number: string | null;
  rarity: Rarity | string | null;
  condition: Condition | string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  inventory_count: number;
  is_preorder: boolean;
  images: string[];
  is_featured: boolean;
  created_at: string;
};

export type NewsCategory =
  | "Set Release"
  | "Market News"
  | "Card Spoilers"
  | "Tournament";

export type NewsArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: NewsCategory | string;
  cover_image_url: string | null;
  author_id: string | null;
  published_at: string | null;
  is_published: boolean;
  source_url: string | null;
  source_name: string | null;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "cancelled"
  | "refunded";

export type Order = {
  id: string;
  user_id: string | null;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  status: OrderStatus;
  total_amount_cents: number;
  shipping_address: Record<string, unknown> | null;
  tracking_number: string | null;
  carrier: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
  product?: Product;
};

// A shop grid entry is either a real listing (with price/inventory) or a
// synced card that has no matching listing yet — see getShopEntries.
export type ShopEntry =
  | { kind: "product"; id: string; product: Product }
  | { kind: "card"; id: string; card: Card; set: Set | null };

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  image: string | null;
  priceCents: number;
  quantity: number;
  condition: string | null;
  maxQuantity: number;
};
