"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { rp } from "@/lib/format";
import { KOL_STATUS_LABEL, KOL_STATUS_ORDER, type KolRowComputed } from "@/lib/kol";
import type { KolStatus } from "@/lib/types";
import { setKolStatus } from "./actions";

export function KolBoard({
  rows,
  onEdit,
}: {
  rows: KolRowComputed[];
  onEdit: (row: KolRowComputed) => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<KolStatus | null>(null);

  function drop(status: KolStatus) {
    const id = dragId;
    setDragId(null);
    setOverCol(null);
    if (!id) return;
    const row = rows.find((r) => r.id === id);
    if (!row || row.status === status) return;
    startTransition(async () => {
      const res = await setKolStatus(id, status);
      if (res.ok) {
        toast.success(`→ ${KOL_STATUS_LABEL[status]}`);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {KOL_STATUS_ORDER.map((status) => {
        const cards = rows.filter((r) => r.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(status);
            }}
            onDragLeave={() => setOverCol((c) => (c === status ? null : c))}
            onDrop={() => drop(status)}
            className={cn(
              "flex w-60 shrink-0 flex-col rounded-xl border bg-muted/30 p-2 transition-colors",
              overCol === status && "border-primary bg-primary/5",
            )}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-semibold">
                {KOL_STATUS_LABEL[status]}
              </span>
              <span className="rounded-full bg-background px-1.5 text-[11px] tabular-nums text-muted-foreground">
                {cards.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {cards.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  draggable
                  onDragStart={() => setDragId(r.id)}
                  onDragEnd={() => setDragId(null)}
                  onClick={() => onEdit(r)}
                  className={cn(
                    "cursor-grab rounded-lg border bg-background p-2.5 text-left text-sm shadow-xs transition-opacity active:cursor-grabbing",
                    dragId === r.id && "opacity-50",
                  )}
                >
                  <p className="truncate font-medium">{r.username}</p>
                  {r.placement && (
                    <p className="truncate text-[11px] text-muted-foreground">
                      {r.placement}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{r.totalCost > 0 ? rp(r.totalCost) : "—"}</span>
                    {r.interaction > 0 && (
                      <span>{r.interaction.toLocaleString("id-ID")} int</span>
                    )}
                  </div>
                </button>
              ))}
              {cards.length === 0 && (
                <p className="px-1 py-3 text-center text-[11px] text-muted-foreground">
                  —
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
