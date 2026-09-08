// A plain Supabase `.select()` caps out at PostgREST's default row limit
// (1000) — once a table grows past that, results are silently truncated
// rather than erroring, which is easy to miss (e.g. building a per-set
// card count from `cards` after the full ~20k-card catalog was synced).
// Page through a query with this instead of relying on one unbounded call.
export async function fetchAllRows<T>(
  queryPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  pageSize = 1000,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await queryPage(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < pageSize) break;
  }
  return rows;
}
