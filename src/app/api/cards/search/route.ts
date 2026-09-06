import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Backs the shop search box's autocomplete: as the admin's card catalog
// (not the products table) is what has full official names, numbers, and
// set context, suggestions are drawn from `cards` rather than `products`
// so a partial name always resolves to the right card + set + number even
// before any matching product is listed for sale.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const setId = searchParams.get("set")?.trim();

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();
  let query = supabase
    .from("cards")
    .select("id, name, number, set:sets(id, name, code)")
    .ilike("name", `%${q}%`)
    .order("name", { ascending: true })
    .limit(12);

  if (setId) {
    query = query.eq("set_id", setId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ results: [] }, { status: 500 });
  }

  return NextResponse.json({ results: data ?? [] });
}
