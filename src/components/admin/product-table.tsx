"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  deleteProduct,
  deleteProducts,
  deleteProductsBySet,
  updateProductInventory,
} from "@/app/admin/products/actions";

type ProductRow = {
  id: string;
  title: string;
  price_cents: number;
  inventory_count: number;
};

type ProductGroup = {
  key: string;
  setId: string | null;
  setName: string;
  products: ProductRow[];
};

export function ProductTable({ groups }: { groups: ProductGroup[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Small catalogs stay expanded by default; large ones (like a freshly
  // imported set) start collapsed so the page isn't one giant scroll.
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(groups.filter((g) => g.products.length <= 20).map((g) => g.key)),
  );

  function toggleOpen(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleGroup(group: ProductGroup, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of group.products) {
        if (checked) next.add(p.id);
        else next.delete(p.id);
      }
      return next;
    });
  }

  function handleBulkDeleteSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (
      !confirm(
        `Delete ${selected.size} selected listing${selected.size === 1 ? "" : "s"}? This can't be undone.`,
      )
    ) {
      e.preventDefault();
    }
  }

  return (
    <div className="mt-8">
      <form action={deleteProducts} onSubmit={handleBulkDeleteSubmit} className="mb-3 flex items-center gap-3">
        <input type="hidden" name="ids" value={Array.from(selected).join(",")} readOnly />
        <p className="text-sm text-muted">
          {selected.size} selected of {groups.reduce((n, g) => n + g.products.length, 0)}
        </p>
        <Button type="submit" size="sm" variant="destructive" disabled={selected.size === 0}>
          Delete Selected
        </Button>
      </form>

      <div className="space-y-3">
        {groups.map((group) => {
          const isOpen = openGroups.has(group.key);
          const allSelected =
            group.products.length > 0 && group.products.every((p) => selected.has(p.id));

          return (
            <div key={group.key} className="overflow-hidden rounded-xl border border-border">
              <div className="flex items-center justify-between gap-3 bg-surface-raised p-3">
                <button
                  type="button"
                  onClick={() => toggleOpen(group.key)}
                  className="flex flex-1 items-center gap-2 text-left text-sm font-semibold"
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                  )}
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleGroup(group, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select all in ${group.setName}`}
                  />
                  {group.setName}{" "}
                  <span className="font-normal text-muted">({group.products.length})</span>
                </button>
                {group.setId && (
                  <form
                    action={deleteProductsBySet}
                    onSubmit={(e) => {
                      if (
                        !confirm(
                          `Delete all ${group.products.length} listing${group.products.length === 1 ? "" : "s"} for ${group.setName}? This can't be undone.`,
                        )
                      ) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="set_id" value={group.setId} />
                    <Button type="submit" size="sm" variant="destructive">
                      Delete All
                    </Button>
                  </form>
                )}
              </div>

              {isOpen && (
                <table className="w-full text-sm">
                  <thead className="text-left text-muted">
                    <tr>
                      <th className="w-8 p-3" />
                      <th className="p-3">Title</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Inventory</th>
                      <th className="p-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {group.products.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selected.has(p.id)}
                            onChange={(e) => toggleOne(p.id, e.target.checked)}
                            aria-label={`Select ${p.title}`}
                          />
                        </td>
                        <td className="p-3">{p.title}</td>
                        <td className="p-3">{formatPrice(p.price_cents)}</td>
                        <td className="p-3">
                          <form action={updateProductInventory} className="flex items-center gap-2">
                            <input type="hidden" name="id" value={p.id} />
                            <Input
                              name="inventory_count"
                              type="number"
                              defaultValue={p.inventory_count}
                              className="h-8 w-20"
                            />
                            <Button size="sm" variant="secondary" type="submit">
                              Save
                            </Button>
                          </form>
                        </td>
                        <td className="p-3">
                          <form action={deleteProduct}>
                            <input type="hidden" name="id" value={p.id} />
                            <Button size="sm" variant="destructive" type="submit">
                              Delete
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
