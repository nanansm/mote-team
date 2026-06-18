"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  Link2,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Send,
  Shield,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  deleteMember,
  inviteMember,
  sendMemberReset,
  setMemberActive,
  setMemberRole,
} from "./actions";
import { MemberFormDialog } from "./member-form-dialog";

export type DirectoryMember = {
  id: string;
  code: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  division: string | null;
  reportsTo: string | null;
  active: boolean;
  account: "active" | "pending" | "none";
  accountRole: "admin" | "member" | null;
  inviteLink: string | null;
};

const DIVISION_TONE: Record<string, string> = {
  creative: "bg-purple-100 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300",
  performance: "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300",
  growth: "bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300",
  business: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
};

function AccountBadge({ status }: { status: DirectoryMember["account"] }) {
  const map = {
    active: ["Akun aktif", "bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300"],
    pending: ["Undangan terkirim", "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"],
    none: ["Belum ada akun", "bg-zinc-100 text-zinc-500 dark:bg-zinc-400/15 dark:text-zinc-400"],
  } as const;
  const [label, tone] = map[status];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", tone)}>
      {label}
    </span>
  );
}

export function TeamView({ directory }: { directory: DirectoryMember[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DirectoryMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DirectoryMember | null>(null);
  const [pending, start] = useTransition();

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(m: DirectoryMember) {
    setEditing(m);
    setFormOpen(true);
  }

  function invite(m: DirectoryMember) {
    start(async () => {
      const r = await inviteMember(m.id);
      if (r.ok) {
        await navigator.clipboard.writeText(r.link).catch(() => {});
        toast.success(
          r.emailed
            ? `Undangan dikirim ke email ${m.email} (link juga disalin).`
            : "Undangan dibuat — link disalin. Kirim manual (email gagal/SMTP off).",
        );
        router.refresh();
      } else toast.error(r.error);
    });
  }
  function copyLink(link: string) {
    navigator.clipboard.writeText(link);
    toast.success("Link undangan disalin");
  }
  function reset(m: DirectoryMember) {
    start(async () => {
      const r = await sendMemberReset(m.id);
      if (r.ok) toast.success(`Email reset password dikirim ke ${m.email}`);
      else toast.error(r.error);
    });
  }
  function toggleActive(m: DirectoryMember) {
    start(async () => {
      const r = await setMemberActive(m.id, !m.active);
      if (r.ok) {
        toast.success(m.active ? "Anggota dinonaktifkan" : "Anggota diaktifkan");
        router.refresh();
      } else toast.error(r.error);
    });
  }
  function changeRole(m: DirectoryMember, role: "admin" | "member") {
    start(async () => {
      const r = await setMemberRole(m.id, role);
      if (r.ok) {
        toast.success(role === "admin" ? "Dijadikan admin" : "Dijadikan member");
        router.refresh();
      } else toast.error(r.error);
    });
  }
  function confirmDelete() {
    if (!deleteTarget) return;
    start(async () => {
      const r = await deleteMember(deleteTarget.id);
      if (r.ok) {
        toast.success("Anggota dihapus");
        setDeleteTarget(null);
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description={`${directory.length} anggota · kelola profil, akun, & akses`}
      >
        <Button onClick={openAdd}>
          <Plus className="size-4" />
          Tambah Anggota
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-3">
        {directory.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex min-w-0 flex-col gap-3 rounded-2xl border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between",
              !m.active && "opacity-60",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar name={m.name} className="size-10 text-sm" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{m.name}</p>
                  {m.code && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {m.code}
                    </span>
                  )}
                  {m.division && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-xs font-medium capitalize",
                        DIVISION_TONE[m.division] ?? "bg-muted text-muted-foreground",
                      )}
                    >
                      {m.division}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {[m.role, m.email].filter(Boolean).join(" · ") || "—"}
                  {m.reportsTo ? ` · lapor ke ${m.reportsTo}` : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap sm:justify-end">
              {m.accountRole === "admin" && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                  Admin
                </span>
              )}
              <AccountBadge status={m.account} />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon" className="size-8" aria-label="Aksi anggota" />}
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => openEdit(m)}>
                    <Pencil className="size-4" />
                    Edit profil
                  </DropdownMenuItem>

                  {m.account === "none" && (
                    <DropdownMenuItem disabled={pending} onClick={() => invite(m)}>
                      <Send className="size-4" />
                      Undang (kirim email)
                    </DropdownMenuItem>
                  )}
                  {m.account === "pending" && m.inviteLink && (
                    <DropdownMenuItem onClick={() => copyLink(m.inviteLink!)}>
                      <Link2 className="size-4" />
                      Salin link undangan
                    </DropdownMenuItem>
                  )}
                  {m.account === "active" && (
                    <DropdownMenuItem disabled={pending} onClick={() => reset(m)}>
                      <KeyRound className="size-4" />
                      Reset password (email)
                    </DropdownMenuItem>
                  )}
                  {m.account === "active" && m.accountRole !== "admin" && (
                    <DropdownMenuItem disabled={pending} onClick={() => changeRole(m, "admin")}>
                      <ShieldCheck className="size-4" />
                      Jadikan admin
                    </DropdownMenuItem>
                  )}
                  {m.account === "active" && m.accountRole === "admin" && (
                    <DropdownMenuItem disabled={pending} onClick={() => changeRole(m, "member")}>
                      <Shield className="size-4" />
                      Jadikan member
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={pending}
                    onClick={() => toggleActive(m)}
                  >
                    <Power className="size-4" />
                    {m.active ? "Nonaktifkan" : "Aktifkan"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={pending}
                    onClick={() => setDeleteTarget(m)}
                  >
                    <Trash2 className="size-4" />
                    Hapus permanen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <MemberFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        member={editing}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus anggota?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              akan dihapus permanen — termasuk akun login-nya (jika ada) dan
              keterkaitannya dengan task yang di-assign. Tindakan ini tidak bisa
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={pending}
            >
              {pending ? "Menghapus…" : "Hapus permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
