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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KOL_STATUS_LABEL, KOL_STATUS_ORDER } from "@/lib/kol";
import type { KolRow, KolStatus } from "@/lib/types";
import { createKol, updateKol, type KolInput } from "./actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  period: string;
  kol?: KolRow | null;
};

// numeric form fields → keys map straight onto KolInput
const PROFILE_NUM = [
  { key: "igFollowers", label: "Followers IG" },
  { key: "igEr", label: "ER IG %" },
  { key: "tiktokFollowers", label: "Followers TikTok" },
  { key: "tiktokEr", label: "ER TikTok %" },
] as const;

const COST_NUM = [
  { key: "fee", label: "Fee / Rate Card (Rp)" },
  { key: "productCost", label: "Product Cost (Rp)" },
] as const;

const RESULT_NUM = [
  { key: "reach", label: "Audience Reach" },
  { key: "impressions", label: "Content Impression" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comment" },
  { key: "shares", label: "Shares" },
  { key: "saves", label: "Saves" },
] as const;

type NumKey =
  | (typeof PROFILE_NUM)[number]["key"]
  | (typeof COST_NUM)[number]["key"]
  | (typeof RESULT_NUM)[number]["key"];

const NUM_KEYS: NumKey[] = [
  ...PROFILE_NUM.map((f) => f.key),
  ...COST_NUM.map((f) => f.key),
  ...RESULT_NUM.map((f) => f.key),
];

const emptyNums = (): Record<NumKey, string> =>
  Object.fromEntries(NUM_KEYS.map((k) => [k, ""])) as Record<NumKey, string>;

export function KolFormDialog({
  open,
  onOpenChange,
  clientId,
  period,
  kol,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(kol);

  const [status, setStatus] = useState<KolStatus>("belum_bales_dm");
  const [username, setUsername] = useState("");
  const [igLink, setIgLink] = useState("");
  const [tiktokLink, setTiktokLink] = useState("");
  const [placement, setPlacement] = useState("");
  const [linkPost, setLinkPost] = useState("");
  const [datePost, setDatePost] = useState("");
  const [notes, setNotes] = useState("");
  const [nums, setNums] = useState<Record<NumKey, string>>(emptyNums());

  useEffect(() => {
    if (!open) return;
    setStatus(kol?.status ?? "belum_bales_dm");
    setUsername(kol?.username ?? "");
    setIgLink(kol?.igLink ?? "");
    setTiktokLink(kol?.tiktokLink ?? "");
    setPlacement(kol?.placement ?? "");
    setLinkPost(kol?.linkPost ?? "");
    setDatePost(kol?.datePost ?? "");
    setNotes(kol?.notes ?? "");
    setNums(
      kol
        ? {
            igFollowers: kol.igFollowers != null ? String(kol.igFollowers) : "",
            igEr: kol.igEr != null ? String(Number(kol.igEr)) : "",
            tiktokFollowers:
              kol.tiktokFollowers != null ? String(kol.tiktokFollowers) : "",
            tiktokEr: kol.tiktokEr != null ? String(Number(kol.tiktokEr)) : "",
            fee: String(Number(kol.fee)),
            productCost: String(Number(kol.productCost)),
            reach: String(kol.reach),
            impressions: String(kol.impressions),
            likes: String(kol.likes),
            comments: String(kol.comments),
            shares: String(kol.shares),
            saves: String(kol.saves),
          }
        : emptyNums(),
    );
  }, [open, kol]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = (k: NumKey) => (nums[k] === "" ? null : Number(nums[k]));
    const req = (k: NumKey) => Number(nums[k]) || 0;
    const payload: KolInput = {
      clientId,
      period,
      status,
      username,
      igLink,
      igFollowers: n("igFollowers"),
      igEr: n("igEr"),
      tiktokLink,
      tiktokFollowers: n("tiktokFollowers"),
      tiktokEr: n("tiktokEr"),
      placement,
      linkPost,
      datePost,
      fee: req("fee"),
      productCost: req("productCost"),
      reach: req("reach"),
      impressions: req("impressions"),
      likes: req("likes"),
      comments: req("comments"),
      shares: req("shares"),
      saves: req("saves"),
      notes,
    };
    startTransition(async () => {
      const result = isEdit
        ? await updateKol(kol!.id, payload)
        : await createKol(payload);
      if (result.ok) {
        toast.success(isEdit ? "KOL diperbarui" : "KOL ditambahkan");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const numField = (key: NumKey, label: string) => (
    <div key={key} className="space-y-2">
      <Label htmlFor={`kol-${key}`}>{label}</Label>
      <Input
        id={`kol-${key}`}
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        value={nums[key]}
        onChange={(e) => setNums((s) => ({ ...s, [key]: e.target.value }))}
        placeholder="0"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit KOL" : "Tambah KOL"}</DialogTitle>
            <DialogDescription>
              Interaction, total cost, ER%, CPE, CPV dihitung otomatis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Identity + status */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="kol-username">Username / Akun</Label>
                <Input
                  id="kol-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nama_kol"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kol-status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) =>
                    setStatus((v as KolStatus) ?? "belum_bales_dm")
                  }
                >
                  <SelectTrigger id="kol-status" className="w-full">
                    <SelectValue>
                      {(v) => KOL_STATUS_LABEL[v as KolStatus] ?? "Status"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {KOL_STATUS_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>
                        {KOL_STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Profiles */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Profil KOL</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="kol-iglink">Link Instagram</Label>
                  <Input
                    id="kol-iglink"
                    value={igLink}
                    onChange={(e) => setIgLink(e.target.value)}
                    placeholder="https://instagram.com/…"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kol-ttlink">Link TikTok</Label>
                  <Input
                    id="kol-ttlink"
                    value={tiktokLink}
                    onChange={(e) => setTiktokLink(e.target.value)}
                    placeholder="https://tiktok.com/@…"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {PROFILE_NUM.map((f) => numField(f.key, f.label))}
              </div>
            </div>

            {/* Collab + cost */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Kolaborasi &amp; Biaya
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="kol-placement">Placement</Label>
                  <Input
                    id="kol-placement"
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    placeholder="Reels & TikTok"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kol-datepost">Date Post</Label>
                  <Input
                    id="kol-datepost"
                    type="date"
                    value={datePost}
                    onChange={(e) => setDatePost(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kol-linkpost">Link Post</Label>
                <Input
                  id="kol-linkpost"
                  value={linkPost}
                  onChange={(e) => setLinkPost(e.target.value)}
                  placeholder="Link konten yang sudah tayang"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {COST_NUM.map((f) => numField(f.key, f.label))}
              </div>
            </div>

            {/* Results */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Hasil Post (gabungan IG + TikTok)
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {RESULT_NUM.map((f) => numField(f.key, f.label))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kol-notes">Catatan</Label>
              <Textarea
                id="kol-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tema konten, brief, dll."
                rows={2}
              />
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
