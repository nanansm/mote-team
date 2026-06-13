"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import type { ClientRow, ClientStatus } from "@/lib/types";
import { deleteClient, setClientStatus } from "./actions";
import { ClientFormDialog } from "./client-form-dialog";

const STATUS_META: Record<
  ClientStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "border-transparent bg-green-100 text-green-700",
  },
  on_hold: {
    label: "On hold",
    className: "border-transparent bg-amber-100 text-amber-700",
  },
  offboarding: {
    label: "Offboarding",
    className: "border-transparent bg-zinc-100 text-zinc-600",
  },
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

export function ClientsView({ clients }: { clients: ClientRow[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientRow | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(row: ClientRow) {
    setEditing(row);
    setFormOpen(true);
  }

  function changeStatus(row: ClientRow, status: ClientStatus) {
    startTransition(async () => {
      const r = await setClientStatus(row.id, status);
      if (r.ok) {
        toast.success("Status klien diperbarui");
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteClient(deleteTarget.id);
      if (result.ok) {
        toast.success("Klien dihapus");
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clients"
        description={`${clients.length} klien terdaftar`}
      >
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Tambah Klien
        </Button>
      </PageHeader>

      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contract End</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  Belum ada klien. Klik{" "}
                  <span className="font-medium">Tambah Klien</span> untuk mulai.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((row) => {
                const meta = STATUS_META[row.status];
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted/40 text-xs font-semibold text-muted-foreground">
                          {row.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={row.logoUrl}
                              alt=""
                              className="size-full object-contain"
                            />
                          ) : (
                            row.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => router.push(`/tasks?client=${row.id}`)}
                          className="text-left hover:text-primary hover:underline"
                          title="Lihat task klien ini"
                        >
                          {row.name}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={meta.className}>
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(row.contractEnd)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="size-8" aria-label="Aksi" />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(row)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {(
                            [
                              ["active", "Active"],
                              ["on_hold", "On hold"],
                              ["offboarding", "Offboarding"],
                            ] as [ClientStatus, string][]
                          ).map(([value, label]) => (
                            <DropdownMenuItem
                              key={value}
                              disabled={row.status === value}
                              onClick={() => changeStatus(row, value)}
                            >
                              <span
                                className={cn(
                                  "size-2 rounded-full",
                                  STATUS_META[value].className.includes("green")
                                    ? "bg-green-500"
                                    : STATUS_META[value].className.includes("amber")
                                      ? "bg-amber-500"
                                      : "bg-zinc-400",
                                )}
                              />
                              {label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(row)}
                          >
                            <Trash2 className="size-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editing}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus klien?</DialogTitle>
            <DialogDescription>
              Klien{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              dan semua task terkait akan dihapus permanen. Tindakan ini tidak
              bisa dibatalkan.
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
              {pending ? "Menghapus…" : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
