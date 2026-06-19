"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fmtNum as fmt, rp } from "@/lib/format";
import { monthLabel, monthOptions } from "@/lib/month";
import type { OfflineRow } from "@/lib/types";
import { saveRevenue, type RevenueInput } from "./actions";

type ClientOpt = { id: string; name: string };

export function OfflineView({
  clients,
  selectedClient,
  period,
  nowMonth,
  row,
}: {
  clients: ClientOpt[];
  selectedClient: string;
  period: string;
  nowMonth: string;
  row: OfflineRow | null;
}) {
  const months = monthOptions(nowMonth);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [targetOmset, setTargetOmset] = useState("");
  const [revenue, setRevenue] = useState("");
  const [numberOfBill, setNumberOfBill] = useState("");
  const [pageView, setPageView] = useState("");
  const [clickOta, setClickOta] = useState("");
  const [clickWhatsapp, setClickWhatsapp] = useState("");
  const [conversionOnline, setConversionOnline] = useState("");
  const [revenueOnline, setRevenueOnline] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setTargetOmset(row ? String(Number(row.targetOmset)) : "");
    setRevenue(row ? String(Number(row.revenue)) : "");
    setNumberOfBill(row ? String(row.numberOfBill) : "");
    setPageView(row?.pageView != null ? String(row.pageView) : "");
    setClickOta(row?.clickOta != null ? String(row.clickOta) : "");
    setClickWhatsapp(row?.clickWhatsapp != null ? String(row.clickWhatsapp) : "");
    setConversionOnline(
      row?.conversionOnline != null ? String(row.conversionOnline) : "",
    );
    setRevenueOnline(
      row?.revenueOnline != null ? String(Number(row.revenueOnline)) : "",
    );
    setNotes(row?.notes ?? "");
  }, [row, selectedClient, period]);

  function navigate(next: { client?: string; period?: string }) {
    const c = next.client ?? selectedClient;
    const p = next.period ?? period;
    router.push(`/offline?client=${c}&period=${p}`);
  }

  // live preview of derived metrics
  const tgt = Number(targetOmset) || 0;
  const rev = Number(revenue) || 0;
  const bill = Number(numberOfBill) || 0;
  const avgSpent = bill > 0 ? Math.round(rev / bill) : 0;
  const achievement = tgt > 0 ? Math.round((rev / tgt) * 1000) / 10 : 0;

  function handleSave() {
    const payload: RevenueInput = {
      clientId: selectedClient,
      period,
      targetOmset: tgt,
      revenue: rev,
      numberOfBill: bill,
      pageView: pageView === "" ? null : Number(pageView),
      clickOta: clickOta === "" ? null : Number(clickOta),
      clickWhatsapp: clickWhatsapp === "" ? null : Number(clickWhatsapp),
      conversionOnline: conversionOnline === "" ? null : Number(conversionOnline),
      revenueOnline: revenueOnline === "" ? null : Number(revenueOnline),
      notes,
    };
    startTransition(async () => {
      const result = await saveRevenue(payload);
      if (result.ok) {
        toast.success("Data tersimpan");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const numInput = (
    id: string,
    label: string,
    value: string,
    set: (v: string) => void,
    placeholder = "0",
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder={placeholder}
        disabled={!selectedClient}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={selectedClient}
          onValueChange={(v) => v && navigate({ client: v })}
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
        <Select
          value={period}
          onValueChange={(v) => v && navigate({ period: v })}
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
      </div>

      {/* Auto-calc preview */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-2 shadow-xs sm:p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground sm:text-[11px]">Revenue</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums sm:mt-1 sm:text-lg">{rp(rev)}</p>
        </div>
        <div className="rounded-lg border bg-card p-2 shadow-xs sm:p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground sm:text-[11px]">Achievement</p>
          <p
            className={cn(
              "mt-0.5 text-sm font-semibold tabular-nums sm:mt-1 sm:text-lg",
              achievement >= 100
                ? "text-green-600 dark:text-green-400"
                : achievement > 0 && achievement < 80
                  ? "text-red-600 dark:text-red-400"
                  : "",
            )}
          >
            {achievement}%
          </p>
        </div>
        <div className="rounded-lg border bg-card p-2 shadow-xs sm:p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground sm:text-[11px]">Avg / bill</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums sm:mt-1 sm:text-lg">{rp(avgSpent)}</p>
        </div>
        <div className="rounded-lg border bg-card p-2 shadow-xs sm:p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground sm:text-[11px]"># Bill</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums sm:mt-1 sm:text-lg">{fmt(bill)}</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-5 rounded-xl border bg-card p-5 shadow-card">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Revenue</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {numInput("rev-target", "Target Omset (Rp)", targetOmset, setTargetOmset)}
            {numInput("rev-revenue", "Revenue (Rp)", revenue, setRevenue)}
            {numInput("rev-bill", "Number of bill", numberOfBill, setNumberOfBill)}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Metrik tambahan (opsional — isi yang relevan saja per klien)
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {numInput("rev-pv", "Page View", pageView, setPageView, "—")}
            {numInput("rev-ota", "Click Link OTA", clickOta, setClickOta, "—")}
            {numInput("rev-wa", "Click WhatsApp", clickWhatsapp, setClickWhatsapp, "—")}
            {numInput("rev-conv", "Conversion Online", conversionOnline, setConversionOnline, "—")}
            {numInput("rev-revon", "Revenue Online (Rp)", revenueOnline, setRevenueOnline, "—")}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rev-notes">Catatan</Label>
          <Textarea
            id="rev-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Sumber data, dll."
            rows={2}
            disabled={!selectedClient}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={pending || !selectedClient}>
            {pending ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
