"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
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
import { clientColor } from "@/lib/client-color";
import {
  TASK_STATUSES,
  TASK_STATUS_MAP,
  type TaskStatus,
} from "@/lib/task-meta";
import { PageHeader } from "@/components/page-header";
import { jakartaParts } from "@/lib/tz";
import { deleteTask, updateTaskDate, updateTaskStatus } from "./actions";
import { TaskFormDialog } from "./task-form-dialog";
import { TaskDetailSheet } from "./task-detail-sheet";
import { TasksBoard } from "./tasks-board";
import { TasksCalendar } from "./tasks-calendar";
import { TasksByClient } from "./tasks-by-client";
import type { ClientOption, MemberOption, TaskRow } from "./types";

type View = "table" | "board" | "calendar" | "client";

const ALL = "all";

// ponytail: hand-rolled Notion-style resizable columns (colgroup + drag),
// no @tanstack/react-table dep. Widths persist per-browser in localStorage.
const COLS = [
  "task", "klien", "status", "assignee", "due", "posting", "actions",
] as const;
type ColKey = (typeof COLS)[number];
const DEFAULT_W: Record<ColKey, number> = {
  task: 320, klien: 160, status: 150, assignee: 180, due: 140, posting: 140, actions: 88,
};
const COLW_KEY = "mote.tasks.colwidths";

const ID_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function monthLabel(value: string): string {
  const [y, m] = value.split("-").map(Number);
  return `${ID_MONTHS[m - 1]} ${y}`;
}

// The month a task belongs to: posting date wins, due date as fallback.
function taskMonth(t: TaskRow): string | null {
  return (t.postingDate ?? t.dueDate)?.slice(0, 7) ?? null;
}

// ±`span` months around the current Jakarta month, oldest → newest.
function monthOptions(current: string, span = 6): string[] {
  const [cy, cm] = current.split("-").map(Number);
  const base = cy * 12 + (cm - 1);
  const out: string[] = [];
  for (let i = -span; i <= span; i++) {
    const total = base + i;
    const y = Math.floor(total / 12);
    const m = (total % 12) + 1;
    out.push(`${y}-${String(m).padStart(2, "0")}`);
  }
  return out;
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

// Inline-editable date cell — reschedule right in the table (Notion-style),
// no need to open the Edit form. Saves on change; reverts on error.
function InlineDate({
  taskId,
  field,
  value,
  onSaved,
}: {
  taskId: string;
  field: "dueDate" | "postingDate";
  value: string | null;
  onSaved: () => void;
}) {
  const [val, setVal] = useState(value ?? "");
  const [pending, start] = useTransition();
  useEffect(() => setVal(value ?? ""), [value]);
  return (
    <input
      type="date"
      value={val}
      disabled={pending}
      onChange={(e) => {
        const v = e.target.value;
        setVal(v);
        start(async () => {
          const r = await updateTaskDate(taskId, field, v || null);
          if (!r.ok) {
            toast.error(r.error);
            setVal(value ?? "");
          } else {
            onSaved();
          }
        });
      }}
      className="w-full rounded bg-transparent px-1 py-0.5 text-xs text-muted-foreground outline-none hover:bg-muted focus:bg-muted focus:text-foreground [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50"
    />
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

  const currentMonth = useMemo(() => {
    const { year, month } = jakartaParts();
    return `${year}-${String(month).padStart(2, "0")}`;
  }, []);
  const months = useMemo(() => monthOptions(currentMonth), [currentMonth]);

  const [clientFilter, setClientFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [assigneeFilter, setAssigneeFilter] = useState(ALL);
  const [monthFilter, setMonthFilter] = useState<string>(currentMonth);
  const [view, setView] = useState<View>("table");
  const [detail, setDetail] = useState<TaskRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Resizable table columns.
  const [colW, setColW] = useState<Record<ColKey, number>>(DEFAULT_W);
  const colWRef = useRef(colW);
  colWRef.current = colW;
  const dragRef = useRef<{ key: ColKey; startX: number; startW: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLW_KEY);
      if (raw) setColW((p) => ({ ...p, ...JSON.parse(raw) }));
    } catch {}
  }, []);

  const onDrag = useCallback((e: MouseEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const w = Math.max(60, d.startW + (e.clientX - d.startX));
    setColW((p) => ({ ...p, [d.key]: w }));
  }, []);
  const endDrag = useCallback(() => {
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", endDrag);
    dragRef.current = null;
    document.body.style.userSelect = "";
    setColW((p) => {
      try {
        localStorage.setItem(COLW_KEY, JSON.stringify(p));
      } catch {}
      return p;
    });
  }, [onDrag]);
  const startDrag = useCallback(
    (key: ColKey, e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = { key, startX: e.clientX, startW: colWRef.current[key] };
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onDrag);
      window.addEventListener("mouseup", endDrag);
    },
    [onDrag, endDrag],
  );

  // Deep-link support: ?client=, ?view=, ?new=1 (e.g. from Clients / command palette).
  const searchParams = useSearchParams();
  // Track the ?task= id we've already auto-opened so a router.refresh() (which
  // hands down a fresh `tasks` array identity) does not re-open a closed sheet.
  const openedTaskRef = useRef<string | null>(null);
  useEffect(() => {
    const c = searchParams.get("client");
    if (c) setClientFilter(c);
    const v = searchParams.get("view");
    if (v === "board" || v === "calendar" || v === "table" || v === "client")
      setView(v);
    if (searchParams.get("new")) {
      setEditing(null);
      setFormOpen(true);
    }
    const taskId = searchParams.get("task");
    if (taskId && openedTaskRef.current !== taskId) {
      const found = tasks.find((t) => t.id === taskId);
      if (found) {
        setDetail(found);
        setDetailOpen(true);
        openedTaskRef.current = taskId;
      }
    }
  }, [searchParams, tasks]);

  function openDetail(t: TaskRow) {
    setDetail(t);
    setDetailOpen(true);
  }

  // Closing the detail clears the ?task= deep-link so it won't re-open on refresh.
  function handleDetailOpenChange(open: boolean) {
    setDetailOpen(open);
    if (!open && searchParams.get("task")) {
      openedTaskRef.current = null;
      router.replace("/tasks");
    }
  }

  // All views apply client + assignee + status filters.
  const scoped = useMemo(() => {
    return tasks.filter((t) => {
      if (clientFilter !== ALL && t.clientId !== clientFilter) return false;
      if (
        assigneeFilter !== ALL &&
        !t.assignees.some((a) => a.id === assigneeFilter)
      )
        return false;
      if (statusFilter !== ALL && t.status !== statusFilter) return false;
      if (monthFilter !== ALL && taskMonth(t) !== monthFilter) return false;
      return true;
    });
  }, [tasks, clientFilter, assigneeFilter, statusFilter, monthFilter]);

  const filtered = scoped;

  // Bundle by brand (client), then by posting date within each brand; sub-tasks
  // stay directly under their parent. `firstOfBrand` flags each brand's first
  // row so the table can draw a divider between brands.
  const ordered = useMemo(() => {
    const visibleIds = new Set(filtered.map((t) => t.id));
    const dateKey = (t: TaskRow) => t.postingDate ?? t.dueDate ?? "9999-12-31";
    const roots = filtered
      .filter((t) => !t.parentId || !visibleIds.has(t.parentId))
      .sort(
        (a, b) =>
          a.clientName.localeCompare(b.clientName) ||
          dateKey(a).localeCompare(dateKey(b)),
      );
    const out: { task: TaskRow; depth: number; firstOfBrand: boolean }[] = [];
    let prevBrand: string | null = null;
    for (const root of roots) {
      const firstOfBrand = root.clientName !== prevBrand;
      prevBrand = root.clientName;
      out.push({ task: root, depth: 0, firstOfBrand });
      const children = filtered
        .filter((t) => t.parentId === root.id)
        .sort((a, b) => dateKey(a).localeCompare(dateKey(b)));
      for (const child of children) {
        out.push({ task: child, depth: 1, firstOfBrand: false });
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
        {(
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
        <Select
          value={monthFilter}
          onValueChange={(v) => setMonthFilter(v ?? currentMonth)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Bulan">
              {(v) => (v === ALL ? "Semua bulan" : monthLabel(v as string))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Semua bulan</SelectItem>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {monthLabel(m)}
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
              ["client", Building2, "Klien"],
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
        <TasksCalendar
          tasks={scoped}
          month={monthFilter === ALL ? currentMonth : monthFilter}
          onMonthChange={setMonthFilter}
          onOpen={openDetail}
        />
      )}
      {view === "client" && (
        <TasksByClient tasks={scoped} clients={clients} onOpen={openDetail} />
      )}

      {view === "table" && (
      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <Table
          className="table-fixed"
          style={{ width: COLS.reduce((s, k) => s + colW[k], 0), minWidth: "100%" }}
        >
          <colgroup>
            {COLS.map((k) => (
              <col key={k} style={{ width: colW[k] }} />
            ))}
          </colgroup>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {(
                [
                  ["task", "Task"],
                  ["klien", "Klien"],
                  ["status", "Status"],
                  ["assignee", "Assignee"],
                  ["due", "Due"],
                  ["posting", "Posting"],
                  ["actions", ""],
                ] as [ColKey, string][]
              ).map(([key, label]) => (
                <TableHead key={key} className="relative">
                  {label}
                  {key !== "actions" && (
                    <span
                      onMouseDown={(e) => startDrag(key, e)}
                      className="absolute right-0 top-0 z-10 h-full w-1.5 cursor-col-resize touch-none select-none hover:bg-primary/40"
                    />
                  )}
                </TableHead>
              ))}
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
              ordered.map(({ task: t, depth, firstOfBrand }) => (
                <TableRow
                  key={t.id}
                  className={cn(firstOfBrand && "border-t-2 border-t-border")}
                >
                  <TableCell
                    className="overflow-hidden"
                    style={{ borderLeft: `3px solid ${clientColor(t.clientId, t.brandColor)}` }}
                  >
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
                        className="truncate text-left text-xs hover:text-primary hover:underline"
                        title={t.title}
                      >
                        {t.title}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="overflow-hidden text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: clientColor(t.clientId, t.brandColor) }}
                      />
                      <span className="truncate">{t.clientName}</span>
                    </span>
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
                  <TableCell className="whitespace-nowrap">
                    <InlineDate
                      taskId={t.id}
                      field="dueDate"
                      value={t.dueDate}
                      onSaved={() => router.refresh()}
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <InlineDate
                      taskId={t.id}
                      field="postingDate"
                      value={t.postingDate}
                      onSaved={() => router.refresh()}
                    />
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
        onOpenChange={handleDetailOpenChange}
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
