"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOkr, updateOkr } from "./actions";
import type { ClientOption, OkrRow } from "./types";

const NONE = "__none__";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  okr?: OkrRow | null;
  clients: ClientOption[];
};

function currentMonth(): string {
  // Derived client-side; only used as a default for new rows.
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function OkrFormDialog({ open, onOpenChange, okr, clients }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(okr);

  const [objective, setObjective] = useState("");
  const [keyResult, setKeyResult] = useState("");
  const [clientId, setClientId] = useState("");
  const [period, setPeriod] = useState("");
  const [target, setTarget] = useState("");
  const [progress, setProgress] = useState("");

  useEffect(() => {
    if (!open) return;
    setObjective(okr?.objective ?? "");
    setKeyResult(okr?.keyResult ?? "");
    setClientId(okr?.clientId ?? "");
    setPeriod(okr?.period ?? currentMonth());
    setTarget(okr ? String(okr.target) : "");
    setProgress(okr ? String(okr.progress) : "");
  }, [open, okr]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      objective,
      keyResult,
      clientId,
      period,
      target: Number(target) || 0,
      progress: Number(progress) || 0,
    };
    startTransition(async () => {
      const result = isEdit
        ? await updateOkr(okr!.id, payload)
        : await createOkr(payload);
      if (result.ok) {
        toast.success(isEdit ? "OKR diperbarui" : "OKR ditambahkan");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit OKR" : "OKR Baru"}</DialogTitle>
            <DialogDescription>
              Objective & key result terukur per periode.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="objective">Objective</Label>
              <Input
                id="objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="mis. Tingkatkan awareness Rancabango"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kr">Key Result / Metrik</Label>
              <Input
                id="kr"
                value={keyResult}
                onChange={(e) => setKeyResult(e.target.value)}
                placeholder="mis. Followers growth, Reach, Leads"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client">Klien</Label>
                <Select
                  value={clientId === "" ? NONE : clientId}
                  onValueChange={(v) => setClientId(!v || v === NONE ? "" : v)}
                >
                  <SelectTrigger id="client" className="w-full">
                    <SelectValue placeholder="— (internal)">
                      {(v) =>
                        !v || v === NONE
                          ? "— (internal)"
                          : (clients.find((c) => c.id === v)?.name ?? "—")
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>— (internal)</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Periode</Label>
                <Input
                  id="period"
                  type="month"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  type="number"
                  min={0}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="progress">Current / Progress</Label>
                <Input
                  id="progress"
                  type="number"
                  min={0}
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
