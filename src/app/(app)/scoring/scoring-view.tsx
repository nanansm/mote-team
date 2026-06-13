"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { setInitiative } from "./actions";

export type ScoreRow = {
  id: string;
  name: string;
  division: string | null;
  completion: number | null;
  okrAvg: number | null;
  initiative: number;
  taskCount: number;
  total: number;
};

function monthLabel(p: string): string {
  const [y, m] = p.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const mi = Number(m) - 1;
  return mi >= 0 && mi < 12 ? `${months[mi]} ${y}` : p;
}

function scoreTone(v: number): string {
  return v >= 80
    ? "bg-green-100 text-green-700"
    : v >= 60
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";
}

function Pct({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            value >= 80 ? "bg-green-500" : value >= 50 ? "bg-primary" : "bg-amber-500",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="tabular-nums">{value}%</span>
    </div>
  );
}

function InitiativeCell({
  memberId,
  month,
  value,
}: {
  memberId: string;
  month: string;
  value: number;
}) {
  const router = useRouter();
  const [v, setV] = useState(String(value));
  const [pending, start] = useTransition();

  function save() {
    const n = Number(v);
    if (Number.isNaN(n) || n === value) return;
    start(async () => {
      const r = await setInitiative(memberId, month, n);
      if (r.ok) router.refresh();
      else toast.error(r.error);
    });
  }

  return (
    <Input
      type="number"
      min={0}
      max={100}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={save}
      disabled={pending}
      className="h-8 w-20"
      aria-label="Score initiative"
    />
  );
}

export function ScoringView({
  rows,
  month,
  months,
}: {
  rows: ScoreRow[];
  month: string;
  months: string[];
}) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skor Bulanan"
        description="Task completion + OKR + inisiatif → skor performa tiap orang."
      >
        <Select
          value={month}
          onValueChange={(v) => router.push(`/scoring?month=${v ?? month}`)}
        >
          <SelectTrigger className="w-40">
            <SelectValue>{(v) => monthLabel(String(v))}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {monthLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nama</TableHead>
              <TableHead className="hidden sm:table-cell">Task</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead className="hidden md:table-cell">OKR</TableHead>
              <TableHead>Inisiatif</TableHead>
              <TableHead className="text-right">Skor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <p className="font-medium">{r.name}</p>
                  {r.division && (
                    <p className="text-xs capitalize text-muted-foreground">
                      {r.division}
                    </p>
                  )}
                </TableCell>
                <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                  {r.taskCount}
                </TableCell>
                <TableCell>
                  <Pct value={r.completion} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Pct value={r.okrAvg} />
                </TableCell>
                <TableCell>
                  <InitiativeCell memberId={r.id} month={month} value={r.initiative} />
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      "inline-block min-w-12 rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums",
                      scoreTone(r.total),
                    )}
                  >
                    {r.total}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Skor = 50% completion task + 30% OKR + 20% inisiatif (komponen yang
        belum ada datanya tidak dihitung). Inisiatif diisi manual oleh admin.
      </p>
    </div>
  );
}
