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
import { clientColor } from "@/lib/client-color";
import {
  createClient,
  getConnectorOptions,
  updateClient,
  type ConnectorOptions,
} from "./actions";

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

const EMPTY_OPTIONS: ConnectorOptions = { ig: [], tiktok: [], gmb: [], meta: [] };

// Sentinel for the "clear" item — base-ui Select treats this as a normal value,
// which we map back to "" (no mapping) on change.
const NONE = "__none__";
type Opt = { value: string; label: string };

/**
 * A connector dropdown fed by live accounts. Disabled with a hint when the
 * source returned nothing (connector not yet connected). Keeps the currently
 * saved value selectable even if it has dropped out of the live list, so
 * editing never silently clears a working mapping.
 */
function ConnectorSelect({
  id,
  label,
  value,
  onChange,
  options,
  loading,
  emptyHint,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  loading: boolean;
  emptyHint: string;
  placeholder: string;
}) {
  const opts =
    value && !options.some((o) => o.value === value)
      ? [{ value, label: value }, ...options]
      : options;
  const empty = !loading && options.length === 0;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value || NONE}
        onValueChange={(v) => onChange(v && v !== NONE ? v : "")}
        disabled={loading || empty}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue>
            {(v) =>
              v && v !== NONE
                ? (opts.find((o) => o.value === v)?.label ?? v)
                : loading
                  ? "Memuat…"
                  : empty
                    ? emptyHint
                    : placeholder
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>— Kosongkan —</SelectItem>
          {opts.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ClientFormDialog({ open, onOpenChange, client }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(client);

  const [name, setName] = useState("");
  const [status, setStatus] = useState<ClientStatus>("active");
  const [contractEnd, setContractEnd] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [color, setColor] = useState("");
  const [igUserId, setIgUserId] = useState("");
  const [replizAccountId, setReplizAccountId] = useState("");
  const [gmbLocationId, setGmbLocationId] = useState("");
  const [tiktokFollowers, setTiktokFollowers] = useState("");
  const [metaAdAccountId, setMetaAdAccountId] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [options, setOptions] = useState<ConnectorOptions>(EMPTY_OPTIONS);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset fields whenever the dialog opens (for create or a specific edit row).
  useEffect(() => {
    if (!open) return;
    setName(client?.name ?? "");
    setStatus(client?.status ?? "active");
    setContractEnd(client?.contractEnd ?? "");
    setLogoUrl(client?.logoUrl ?? "");
    setColor(client?.color ?? "");
    setIgUserId(client?.igUserId ?? "");
    setReplizAccountId(client?.replizAccountId ?? "");
    setGmbLocationId(client?.gmbLocationId ?? "");
    setTiktokFollowers(
      client?.tiktokFollowers != null ? String(client.tiktokFollowers) : "",
    );
    setMetaAdAccountId(client?.metaAdAccountId ?? "");
    setNotes(client?.notes ?? "");
  }, [open, client]);

  // Lazy-load connector accounts only when the dialog is open, so the Clients
  // page itself never waits on Windsor/Meta.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingOptions(true);
    getConnectorOptions()
      .then((opts) => {
        if (!cancelled) setOptions(opts);
      })
      .catch(() => {
        if (!cancelled) setOptions(EMPTY_OPTIONS);
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

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
      color,
      igUserId,
      replizAccountId,
      gmbLocationId,
      tiktokFollowers: tiktokFollowers ? Number(tiktokFollowers) : null,
      metaAdAccountId,
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

            <div className="space-y-2">
              <Label htmlFor="brand-color">Warna brand (di list task)</Label>
              <div className="flex items-center gap-3">
                <span
                  className="size-9 shrink-0 rounded-md border"
                  style={{ backgroundColor: clientColor(client?.id, color) }}
                />
                <Input
                  id="brand-color"
                  type="color"
                  value={clientColor(client?.id, color)}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-16 cursor-pointer p-1"
                />
                {color ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => setColor("")}
                  >
                    <X className="size-4" />
                    Otomatis
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Otomatis (dari nama). Pilih warna untuk mengunci.
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ConnectorSelect
                id="ig-account"
                label="Instagram account"
                value={igUserId}
                onChange={setIgUserId}
                options={options.ig.map((a) => ({
                  value: a.id,
                  label: a.username,
                }))}
                loading={loadingOptions}
                emptyHint="Belum ada akun IG"
                placeholder="Pilih akun IG"
              />
              <ConnectorSelect
                id="tiktok-account"
                label="TikTok account (Repliz)"
                value={replizAccountId}
                onChange={setReplizAccountId}
                options={options.tiktok.map((a) => ({
                  value: a.id,
                  label: a.username,
                }))}
                loading={loadingOptions}
                emptyHint="Belum ada akun TikTok"
                placeholder="Pilih akun TikTok"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ConnectorSelect
                id="meta-ad"
                label="Meta Ad Account"
                value={metaAdAccountId}
                onChange={setMetaAdAccountId}
                options={options.meta.map((m) => ({
                  value: m.id,
                  label: m.name,
                }))}
                loading={loadingOptions}
                emptyHint="Belum ada Ad Account"
                placeholder="Pilih Ad Account"
              />
              <ConnectorSelect
                id="gmb-location"
                label="Google Maps (GMB)"
                value={gmbLocationId}
                onChange={setGmbLocationId}
                options={options.gmb.map((l) => ({
                  value: l.id,
                  label: l.title,
                }))}
                loading={loadingOptions}
                emptyHint="Belum ada lokasi GMB"
                placeholder="Pilih lokasi GMB"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok-followers">TikTok followers (manual)</Label>
              <Input
                id="tiktok-followers"
                type="number"
                min={0}
                value={tiktokFollowers}
                onChange={(e) => setTiktokFollowers(e.target.value)}
                placeholder="mis. 5432"
              />
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">
              Akun IG (Meta), TikTok (Repliz) &amp; GMB (Google) diambil langsung
              dari yang sudah terhubung. Followers TikTok diisi manual (Repliz
              tak menyediakan angka total).
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
