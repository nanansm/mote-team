"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClientRow, ClientStatus } from "@/lib/types";
import { createClient, updateClient } from "./actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientRow | null;
};

const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "offboarding", label: "Offboarding" },
];

export function ClientFormDialog({ open, onOpenChange, client }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(client);

  const [name, setName] = useState("");
  const [status, setStatus] = useState<ClientStatus>("active");
  const [contractEnd, setContractEnd] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [windsorAccountId, setWindsorAccountId] = useState("");
  const [windsorTiktokId, setWindsorTiktokId] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset fields whenever the dialog opens (for create or a specific edit row).
  useEffect(() => {
    if (!open) return;
    setName(client?.name ?? "");
    setStatus(client?.status ?? "active");
    setContractEnd(client?.contractEnd ?? "");
    setLogoUrl(client?.logoUrl ?? "");
    setWindsorAccountId(client?.windsorAccountId ?? "");
    setWindsorTiktokId(client?.windsorTiktokId ?? "");
    setNotes(client?.notes ?? "");
  }, [open, client]);

  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "logo");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) setLogoUrl(data.url);
      else toast.error(data.error ?? "Upload gagal");
    } catch {
      toast.error("Upload gagal");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name,
      status,
      contractEnd,
      logoUrl,
      windsorAccountId,
      windsorTiktokId,
      notes,
    };
    startTransition(async () => {
      const result = isEdit
        ? await updateClient(client!.id, payload)
        : await createClient(payload);
      if (result.ok) {
        toast.success(isEdit ? "Klien diperbarui" : "Klien ditambahkan");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Klien" : "Tambah Klien"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Perbarui detail klien."
                : "Tambahkan klien baru ke directory."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Klien</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="mis. Rancabango Hotel"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ClientStatus)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue>
                    {(v) =>
                      STATUS_OPTIONS.find((o) => o.value === v)?.label ?? "Status"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractEnd">Contract End</Label>
              <Input
                id="contractEnd"
                type="date"
                value={contractEnd}
                onChange={(e) => setContractEnd(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-3">
                <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted/40">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="size-full object-contain"
                    />
                  ) : (
                    <ImagePlus className="size-5 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleLogo}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ImagePlus className="size-4" />
                    )}
                    {logoUrl ? "Ganti" : "Unggah PNG"}
                  </Button>
                  {logoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                      onClick={() => setLogoUrl("")}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                PNG/JPG, auto-resize ke maks 400×400.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="windsor-ig">Windsor IG account name</Label>
                <Input
                  id="windsor-ig"
                  value={windsorAccountId}
                  onChange={(e) => setWindsorAccountId(e.target.value)}
                  placeholder="mis. rancabango_hotel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="windsor-tt">Windsor TikTok account name</Label>
                <Input
                  id="windsor-tt"
                  value={windsorTiktokId}
                  onChange={(e) => setWindsorTiktokId(e.target.value)}
                  placeholder="mis. RancabangoHotelResortGarut"
                />
              </div>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">
              Untuk menarik performa organic di menu Performance (account_name
              persis dari Windsor).
            </p>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan untuk tim</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Brief, link Drive/brand guide, tone of voice, dll. Boleh tempel link."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Link otomatis bisa diklik saat ditampilkan ke tim.
              </p>
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
