"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { monthLabel, monthOptions, monthWindow } from "@/lib/month";

type ClientOpt = { id: string; name: string };

export function PulseFilters({
  clients,
  selectedClient,
  from,
  to,
  nowMonth,
  isCustom,
}: {
  clients: ClientOpt[];
  selectedClient: string;
  from: string;
  to: string;
  nowMonth: string;
  isCustom: boolean;
}) {
  const router = useRouter();
  const [custom, setCustom] = useState(isCustom);
  const [f, setF] = useState(from);
  const [t, setT] = useState(to);

  const selectedMonth = from.slice(0, 7);
  const months = monthOptions(nowMonth, 11, 1).reverse();

  function go(params: Record<string, string>) {
    const sp = new URLSearchParams({ client: selectedClient, from, to, ...params });
    router.push(`/pulse?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={selectedClient}
        onValueChange={(v) => v && go({ client: v })}
      >
        <SelectTrigger className="w-52">
          <SelectValue>
            {(v) => clients.find((c) => c.id === v)?.name ?? "Pilih klien"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!custom && (
        <Select
          value={selectedMonth}
          onValueChange={(v) => {
            if (!v) return;
            const w = monthWindow(v);
            go({ from: w.from, to: w.to });
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue>
              {(v) => monthLabel(v as string)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {monthLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {custom && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={f}
            onChange={(e) => setF(e.target.value)}
            className="w-40"
            aria-label="Dari"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="date"
            value={t}
            onChange={(e) => setT(e.target.value)}
            className="w-40"
            aria-label="Sampai"
          />
          <Button size="sm" onClick={() => f && t && go({ from: f, to: t })} disabled={!f || !t}>
            Terapkan
          </Button>
        </div>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={() => setCustom((c) => !c)}
      >
        {custom ? "Pakai bulan" : "Custom"}
      </Button>
    </div>
  );
}
