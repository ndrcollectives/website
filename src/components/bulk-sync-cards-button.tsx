"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { syncCardsForSetSilent } from "@/app/admin/sets/actions";

type SetRow = { id: string; code: string; name: string };

// Keeps a handful of requests in flight at once instead of syncing every
// set one at a time — GitHub's raw content CDN and Supabase both handle
// this fine, and it cuts a 174-set run from many minutes to a couple.
const CONCURRENCY = 5;

export function BulkSyncCardsButton({ sets }: { sets: SetRow[] }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [summary, setSummary] = useState<{ cards: number; failed: string[] } | null>(null);

  async function runAll() {
    setRunning(true);
    setSummary(null);
    setDone(0);

    let totalCards = 0;
    const failed: string[] = [];
    let cursor = 0;

    async function worker() {
      for (;;) {
        const index = cursor++;
        if (index >= sets.length) return;
        const set = sets[index];
        const result = await syncCardsForSetSilent(set.id, set.code);
        if ("error" in result) {
          failed.push(`${set.name}: ${result.error}`);
        } else {
          totalCards += result.synced;
        }
        setDone((n) => n + 1);
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, sets.length) }, () => worker()),
    );

    setSummary({ cards: totalCards, failed });
    setRunning(false);
    router.refresh();
  }

  return (
    <div className="mt-6">
      <Button
        type="button"
        variant="secondary"
        onClick={runAll}
        disabled={running || sets.length === 0}
      >
        {running && <Loader2 className="h-4 w-4 animate-spin" />}
        {running ? `Syncing cards… (${done}/${sets.length})` : "Sync Cards for All Sets"}
      </Button>
      <p className="mt-2 text-xs text-muted">
        Loops through every set above and pulls its card checklist, instead
        of syncing each set&apos;s cards one at a time. Can take a few
        minutes for the full catalog.
      </p>
      {summary && (
        <p className="mt-2 text-xs text-accent-yellow">
          Synced {summary.cards} cards across {sets.length - summary.failed.length} sets.
          {summary.failed.length > 0 && (
            <>
              {" "}
              {summary.failed.length} set{summary.failed.length === 1 ? "" : "s"} failed:{" "}
              {summary.failed.slice(0, 3).join("; ")}
              {summary.failed.length > 3 ? "…" : ""}
            </>
          )}
        </p>
      )}
    </div>
  );
}
