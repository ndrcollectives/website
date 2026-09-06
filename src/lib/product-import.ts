// Maps a collection-tracker CSV export (columns like Portfolio Name, Set,
// Product Name, Card Number, Rarity, Variance, Grade, Card Condition,
// Quantity, Market Price, Price Override — see the admin's CSV importer)
// into product rows for the shop. Pure/testable: takes lookups the admin
// action already has to fetch (set ids, card images, existing listings)
// rather than querying Supabase itself.
import { parseCsv } from "@/lib/csv";
import { normalizeCardNumber } from "@/lib/card-number";

export type CsvProductRow = {
  setName: string;
  productName: string;
  cardNumber: string;
  rarity: string;
  variance: string;
  grade: string;
  cardCondition: string;
  quantity: number;
  marketPrice: number;
  priceOverride: number;
};

function findHeader(headers: string[], matcher: (h: string) => boolean): string | undefined {
  return headers.find((h) => matcher(h.trim().toLowerCase()));
}

export function parseProductCsv(text: string): CsvProductRow[] {
  const records = parseCsv(text);
  if (records.length === 0) return [];

  const headers = Object.keys(records[0]);
  const col = {
    set: findHeader(headers, (h) => h === "set"),
    product: findHeader(headers, (h) => h === "product name"),
    number: findHeader(headers, (h) => h === "card number"),
    rarity: findHeader(headers, (h) => h === "rarity"),
    variance: findHeader(headers, (h) => h === "variance"),
    grade: findHeader(headers, (h) => h === "grade"),
    condition: findHeader(headers, (h) => h === "card condition"),
    quantity: findHeader(headers, (h) => h === "quantity"),
    // has a variable "(As of YYYY-MM-DD)" suffix, so match by prefix
    marketPrice: findHeader(headers, (h) => h.startsWith("market price")),
    priceOverride: findHeader(headers, (h) => h === "price override"),
  };

  return records.map((r) => ({
    setName: col.set ? r[col.set] : "",
    productName: col.product ? r[col.product] : "",
    cardNumber: col.number ? r[col.number] : "",
    rarity: col.rarity ? r[col.rarity] : "",
    variance: col.variance ? r[col.variance] : "",
    grade: col.grade ? r[col.grade] : "",
    cardCondition: col.condition ? r[col.condition] : "",
    quantity: col.quantity ? Number(r[col.quantity]) || 0 : 0,
    marketPrice: col.marketPrice ? Number(r[col.marketPrice]) || 0 : 0,
    priceOverride: col.priceOverride ? Number(r[col.priceOverride]) || 0 : 0,
  }));
}

const CONDITION_CODES: Record<string, string> = {
  mint: "M",
  "near mint": "NM",
  "lightly played": "LP",
  "moderately played": "MP",
  "heavily played": "HP",
  damaged: "DMG",
};

export function mapCondition(raw: string): string {
  return CONDITION_CODES[raw.trim().toLowerCase()] ?? raw.trim();
}

// "PSA 10" -> "Graded_PSA10", "BGS 9.5" -> "Graded_BGS95"; anything that
// doesn't parse just gets stripped of punctuation rather than dropped —
// the DB column is plain text, no fixed enum to satisfy.
export function mapGrade(grade: string): string {
  const match = grade.trim().match(/^([A-Za-z]+)\s*([\d.]+)$/);
  if (!match) return `Graded_${grade.trim().replace(/[^A-Za-z0-9]/g, "")}`;
  const [, company, num] = match;
  return `Graded_${company.toUpperCase()}${num.replace(".", "")}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type ProductInsert = {
  title: string;
  slug: string;
  product_type: "single" | "graded_slab";
  set_id: string;
  card_number: string;
  rarity: string | null;
  condition: string;
  price_cents: number;
  inventory_count: number;
  images: string[];
};

export type ImportSummary = {
  inserted: number;
  skippedNoSet: string[];
  skippedDuplicate: number;
  skippedNoPrice: number;
};

// setNameToId: the CSV's "Set" column matched (case-insensitively) to a
// sets.id — there's no other stable key linking a portfolio export to a
// specific synced set.
// cardImages: (set_id + number) -> that card's synced image, so a listing
// gets a real photo without the admin pasting a URL by hand.
// existingKeys: (set_id + number + condition + title) already listed, so
// re-uploading the same/updated export doesn't create duplicate listings.
export function buildProductInserts(
  rows: CsvProductRow[],
  setNameToId: Map<string, string>,
  cardImages: Map<string, string>,
  existingKeys: Set<string>,
): { inserts: ProductInsert[]; summary: ImportSummary } {
  const inserts: ProductInsert[] = [];
  const summary: ImportSummary = {
    inserted: 0,
    skippedNoSet: [],
    skippedDuplicate: 0,
    skippedNoPrice: 0,
  };
  const seenThisBatch = new Set<string>();

  rows.forEach((row, index) => {
    if (!row.productName || !row.setName) return;

    const setId = setNameToId.get(row.setName.trim().toLowerCase());
    if (!setId) {
      if (!summary.skippedNoSet.includes(row.setName)) {
        summary.skippedNoSet.push(row.setName);
      }
      return;
    }

    const isGraded = !!row.grade && row.grade.trim().toLowerCase() !== "ungraded";
    const condition = isGraded
      ? mapGrade(row.grade)
      : mapCondition(row.cardCondition || "Near Mint");

    const price = row.priceOverride > 0 ? row.priceOverride : row.marketPrice;
    if (!price || price <= 0) {
      summary.skippedNoPrice += 1;
      return;
    }

    const varianceSuffix =
      row.variance && row.variance.trim().toLowerCase() !== "normal"
        ? ` · ${row.variance}`
        : "";
    const title = `${row.productName}${varianceSuffix}`;

    const dedupeKey = `${setId}::${row.cardNumber}::${condition}::${title}`;
    if (existingKeys.has(dedupeKey) || seenThisBatch.has(dedupeKey)) {
      summary.skippedDuplicate += 1;
      return;
    }
    seenThisBatch.add(dedupeKey);

    // cardImages is keyed by the synced catalog's bare number (e.g. "180"),
    // not the CSV's "180/217" — normalize before looking it up.
    const image = cardImages.get(`${setId}::${normalizeCardNumber(row.cardNumber)}`);

    inserts.push({
      title,
      slug: `${slugify(title)}-${slugify(row.cardNumber)}-${index}`,
      product_type: isGraded ? "graded_slab" : "single",
      set_id: setId,
      card_number: row.cardNumber,
      rarity: row.rarity || null,
      condition,
      price_cents: Math.round(price * 100),
      inventory_count: row.quantity > 0 ? row.quantity : 1,
      images: image ? [image] : [],
    });
    summary.inserted += 1;
  });

  return { inserts, summary };
}
