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
import { createMember, updateMember } from "./actions";
import type { DirectoryMember } from "./team-view";

const NONE = "__none__";
const DIVISIONS = [
  { value: "creative", label: "Creative" },
  { value: "performance", label: "Performance" },
  { value: "growth", label: "Growth" },
  { value: "business", label: "Business" },
];

export function MemberFormDialog({
  open,
  onOpenChange,
  member,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  member?: DirectoryMember | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const isEdit = Boolean(member);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [division, setDivision] = useState("");
  const [code, setCode] = useState("");
  const [reportsTo, setReportsTo] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(member?.name ?? "");
    setEmail(member?.email ?? "");
    setRole(member?.role ?? "");
    setDivision(member?.division ?? "");
    setCode(member?.code ?? "");
    setReportsTo(member?.reportsTo ?? "");
  }, [open, member]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name,
      email,
      role,
      division: division as "" | "creative" | "performance" | "growth" | "business",
      code,
      reportsTo,
    };
    start(async () => {
      const r = isEdit
        ? await updateMember(member!.id, payload)
        : await createMember(payload);
      if (r.ok) {
        toast.success(isEdit ? "Anggota diperbarui" : "Anggota ditambahkan");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Anggota" : "Tambah Anggota"}</DialogTitle>
            <DialogDescription>
              Profil tim. Email dipakai untuk undangan & notifikasi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Label htmlFor="m-name">Nama</Label>
                <Input id="m-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-code">Kode</Label>
                <Input id="m-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="K011" className="w-24" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-email">Email</Label>
              <Input id="m-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@motekreatif.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-role">Role / Jabatan</Label>
              <Input id="m-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="mis. Graphic Design" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="m-div">Divisi</Label>
                <Select
                  value={division === "" ? NONE : division}
                  onValueChange={(v) => setDivision(!v || v === NONE ? "" : v)}
                >
                  <SelectTrigger id="m-div" className="w-full">
                    <SelectValue placeholder="—">
                      {(v) =>
                        !v || v === NONE
                          ? "—"
                          : (DIVISIONS.find((d) => d.value === v)?.label ?? "—")
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>—</SelectItem>
                    {DIVISIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-reports">Lapor ke</Label>
                <Input id="m-reports" value={reportsTo} onChange={(e) => setReportsTo(e.target.value)} placeholder="Nama head" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
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
