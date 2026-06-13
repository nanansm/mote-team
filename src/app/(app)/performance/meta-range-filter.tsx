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
import { META_PRESETS } from "@/lib/meta-presets";

export function MetaRangeFilter({
  value,
  from,
  to,
}: {
  value: string;
  from?: string;
  to?: string;
}) {
  const router = useRouter();
  const [custom, setCustom] = useState(value === "custom");
  const [f, setF] = useState(from ?? "");
  const [t, setT] = useState(to ?? "");

  function onPreset(v: string) {
    if (v === "custom") {
      setCustom(true);
      return;
    }
    setCustom(false);
    router.push(`/performance?range=${v}`);
  }

  function applyCustom() {
    if (f && t) router.push(`/performance?from=${f}&to=${t}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={custom ? "custom" : value} onValueChange={(v) => onPreset(v ?? "last_30d")}>
        <SelectTrigger className="w-44">
          <SelectValue>
            {(v) =>
              v === "custom"
                ? "Custom"
                : (META_PRESETS.find((p) => p.value === v)?.label ?? "Range")
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {META_PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom…</SelectItem>
        </SelectContent>
      </Select>
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
          <Button size="sm" onClick={applyCustom} disabled={!f || !t}>
            Terapkan
          </Button>
        </div>
      )}
    </div>
  );
}
