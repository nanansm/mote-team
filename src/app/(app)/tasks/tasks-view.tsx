"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Columns3,
  CornerDownRight,
  Eye,
  LayoutList,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  TASK_STATUSES,
  TASK_STATUS_MAP,
  type TaskStatus,
} from "@/lib/task-meta";
import { PageHeader } from "@/components/page-header";
import { deleteTask, updateTaskStatus } from "./actions";
import { TaskFormDialog } from "./task-form-dialog";
import { TaskDetailSheet } from "./task-detail-sheet";
import { TasksBoard } from "./tasks-board";
import { TasksCalendar } from "./tasks-calendar";
import type { ClientOption, MemberOption, TaskRow } from "./types";

type View = "table" | "board" | "calendar";

const ALL = "all";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function StatusSelect({
  taskId,
  status,
  onChanged,
}: {
  taskId: string;
  status: TaskStatus;
  onChanged: () => void;
}) {
  const [pending, start] = useTransition();
  const meta = TASK_STATUS_MAP[status];
  return (
    <Select
      value={status}
      onValueChange={(v) =>
        start(async () => {
          const r = await updateTaskStatus(taskId, v as TaskStatus);
          if (r.ok) onChanged();
          else toast.error(r.error);
        })
      }
      disabled={pending}
    >
      <SelectTrigger
        className={cn(
          "h-7 w-auto gap-1.5 rounded-full border-0 px-2.5 text-xs font-medium shadow-none focus-visible:ring-1",
          meta.badge,
        )}
      >
        <span className={cn("size-1.5 rounded-full", meta.dot)} />
        <span>{meta.label}</span>
      </SelectTrigger>
      <SelectContent>
        {TASK_STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function AssigneeChips({ names }: { names: string[] }) {
  if (names.length === 0)
    return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {names.map((n) => (
        <span
          key={n}
          className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
        >
          {n}
        </span>
      ))}
    </div>
  );
}

export function TasksView({
  tasks,
  clients,
  members,
}: {
  tasks: TaskRow[];
  clients: ClientOption[];
  members: MemberOption[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskRow | null>(null);
  const [pending, startTransition] = useTransition();

  const [clientFilter, setClientFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState<string>("in_progress");
  const [assigneeFilter, setAssigneeFilter] = useState(ALL);
  const [view, setView] = useState<View>("table");
  const [detail, setDetail] = useState<TaskRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Deep-link support: ?client=, ?view=, ?new=1 (e.g. from Clients / command palette).
  const searchParams = useSearchParams();
  useEffect(() => {
    const c = searchParams.get("client");
    if (c) setClientFilter(c);
    const v = searchParams.get("view");
    if (v === "board" || v === "calendar" || v === "table") setView(v);
    if (searchParams.get("new")) {
      setEditing(null);
      setFormOpen(true);
    }
  }, [searchParams]);

  function openDetail(t: TaskRow) {
    setDetail(t);
    setDetailOpen(true);
  }

  // Board & calendar group by status/date themselves → only apply client + assignee.
  const scoped = useMemo(() => {
    return tasks.filter((t) => {
      if (clientFilter !== ALL && t.clientId !== clientFilter) return false;
      if (
        assigneeFilter !== ALL &&
        !t.assignees.some((a) => a.id === assigneeFilter)
      )
        return false;
      return true;
    });
  }, [tasks, clientFilter, assigneeFilter]);

  // Table additionally applies the status filter.
  const filtered = useMemo(
    () =>
      statusFilter === ALL
        ? scoped
        : scoped.filter((t) => t.status === statusFilter),
    [scoped, statusFilter],
  );

  // Build a 2-level ordering: roots (in view), each followed by its sub-tasks.
  const ordered = useMemo(() => {
    const visibleIds = new Set(filtered.map((t) => t.id));
    const roots = filtered.filter(
      (t) => !t.parentId || !visibleIds.has(t.parentId),
    );
    const out: { task: TaskRow; depth: number }[] = [];
    for (const root of roots) {
      out.push({ task: root, depth: 0 });
      for (const child of filtered.filter((t) => t.parentId === root.id)) {
        out.push({ task: child, depth: 1 });
      }
    }
    return out;
  }, [filtered]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(t: TaskRow) {
    setEditing(t);
    setFormOpen(true);
  }
  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const r = await deleteTask(deleteTarget.id);
      if (r.ok) {
        toast.success("Task dihapus");
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tasks"
        description={`${filtered.length} dari ${tasks.length} task`}
      >
        <Button onClick={openCreate} disabled={clients.length === 0}>
          <Plus className="size-4" />
          Task Baru
        </Button>
      </PageHeader>

      {/* Filters + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
        <Select
          value={clientFilter}
          onValueChange={(v) => setClientFilter(v ?? ALL)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Klien">
              {(v) =>
                v === ALL
                  ? "Semua klien"
                  : (clients.find((c) => c.id === v)?.name ?? "Klien")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Semua klien</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {view === "table" && (
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v ?? ALL)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status">
                {(v) =>
                  v === ALL
                    ? "Semua status"
                    : (TASK_STATUS_MAP[v as TaskStatus]?.label ?? "Status")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua status</SelectItem>
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select
          value={assigneeFilter}
          onValueChange={(v) => setAssigneeFilter(v ?? ALL)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Assignee">
              {(v) =>
                v === ALL
                  ? "Semua orang"
                  : (members.find((m) => m.id === v)?.name ?? "Assignee")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Semua orang</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-0.5 rounded-lg border bg-card p-0.5">
          {(
            [
              ["table", LayoutList, "Tabel"],
              ["board", Columns3, "Board"],
              ["calendar", CalendarDays, "Kalender"],
            ] as [View, typeof LayoutList, string][]
          ).map(([v, Icon, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-label={label}
              title={label}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                view === v
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {view === "board" && <TasksBoard tasks={scoped} onOpen={openDetail} />}
      {view === "calendar" && (
        <TasksCalendar tasks={scoped} onOpen={openDetail} />
      )}

      {view === "table" && (
      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Task</TableHead>
              <TableHead>Klien</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Posting</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  {tasks.length === 0
                    ? "Belum ada task. Klik Task Baru untuk mulai."
                    : "Tidak ada task yang cocok dengan filter."}
                </TableCell>
              </TableRow>
            ) : (
              ordered.map(({ task: t, depth }) => (
                <TableRow key={t.id}>
                  <TableCell className="max-w-xs">
                    <div
                      className={cn(
                        "flex items-center gap-1.5",
                        depth > 0 && "pl-5 text-muted-foreground",
                      )}
                    >
                      {depth > 0 && (
                        <CornerDownRight className="size-3.5 shrink-0 text-muted-foreground/60" />
                      )}
                      {t.mediaUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.mediaUrl}
                          alt=""
                          className="size-6 shrink-0 rounded object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => openDetail(t)}
                        className="truncate text-left font-medium hover:text-primary hover:underline"
                        title={t.title}
                      >
                        {t.title}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.clientName}
                  </TableCell>
                  <TableCell>
                    <StatusSelect
                      taskId={t.id}
                      status={t.status}
                      onChanged={() => router.refresh()}
                    />
                  </TableCell>
                  <TableCell>
                    <AssigneeChips names={t.assignees.map((a) => a.name)} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(t.dueDate)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(t.postingDate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      aria-label="Lihat task"
                      onClick={() => openDetail(t)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="size-8" aria-label="Aksi" />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(t)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(t)}
                        >
                          <Trash2 className="size-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      )}

      <TaskDetailSheet
        task={detail}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(t) => {
          setDetailOpen(false);
          openEdit(t);
        }}
      />

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        clients={clients}
        members={members}
        allTasks={tasks}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus task?</DialogTitle>
            <DialogDescription>
              Task{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.title}
              </span>{" "}
              dan semua sub-task-nya akan dihapus permanen.
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
