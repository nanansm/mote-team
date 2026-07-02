"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Columns3,
  ArrowUpDown,
  CornerDownRight,
  Eye,
  GripVertical,
  LayoutList,
  Link2,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Share2,
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
  TYPE_CONTENTS,
  TYPE_CONTENT_MAP,
  type TaskStatus,
} from "@/lib/task-meta";
import { PageHeader } from "@/components/page-header";
import { jakartaParts } from "@/lib/tz";
import { deleteTask, reorderTasks, updateTaskDate, updateTaskStatus } from "./actions";
import { TaskFormDialog } from "./task-form-dialog";
import { TaskDetailSheet } from "./task-detail-sheet";
import { taskShareText } from "./share";
import { TasksBoard } from "./tasks-board";
import { TasksCalendar } from "./tasks-calendar";
import { TasksByClient } from "./tasks-by-client";
import type { ClientOption, MemberOption, TaskRow } from "./types";

type View = "table" | "board" | "calendar" | "client";

const ALL = "all";

// #13 Sort. "manual" = drag order (#9), only mode where the grip is active.
type SortKey = "manual" | "posting" | "due" | "name" | "content";
const SORTS: { value: SortKey; label: string }[] = [
  { value: "manual", label: "Manual (drag)" },
  { value: "posting", label: "Tanggal posting" },
  { value: "due", label: "Due date" },
  { value: "name", label: "Nama" },
  { value: "content", label: "Per jenis konten" },
];

const TYPE_RANK = new Map(TYPE_CONTENTS.map((t, i) => [t.value, i]));
const dateKey = (t: TaskRow) => t.postingDate ?? t.dueDate ?? "9999-12-31";
const dueKey = (t: TaskRow) => t.dueDate ?? "9999-12-31";
// Tasks without a type sort last.
const typeRank = (t: TaskRow) =>
  t.typeContent != null ? (TYPE_RANK.get(t.typeContent) ?? 98) : 99;

/** Within-brand comparator for the chosen sort. */
function makeCmp(sort: SortKey): (a: TaskRow, b: TaskRow) => number {
  return (a, b) => {
    switch (sort) {
      case "posting":
        return dateKey(a).localeCompare(dateKey(b)) || a.title.localeCompare(b.title);
      case "due":
        return dueKey(a).localeCompare(dueKey(b)) || a.title.localeCompare(b.title);
      case "name":
        return a.title.localeCompare(b.title);
      case "content":
        return typeRank(a) - typeRank(b) || dateKey(a).localeCompare(dateKey(b));
      case "manual":
      default:
        return a.sortOrder - b.sortOrder || dateKey(a).localeCompare(dateKey(b));
    }
  };
}

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
  const [typeFilter, setTypeFilter] = useState<string>(ALL);
  const [monthFilter, setMonthFilter] = useState<string>(currentMonth);
  const [sortKey, setSortKey] = useState<SortKey>("manual");
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
    // Strip one-shot filter params (client/view/new) from the URL after applying
    // them, so a browser tab-restore reopens with clean "Semua" filters instead
    // of re-pinning the last filtered view. Keep ?task= (handled on sheet close).
    if (c || v || searchParams.get("new")) {
      router.replace(taskId ? `/tasks?task=${taskId}` : "/tasks", { scroll: false });
    }
  }, [searchParams, tasks, router]);

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

  // All views apply client + assignee + status + content-type filters.
  const scoped = useMemo(() => {
    return tasks.filter((t) => {
      if (clientFilter !== ALL && t.clientId !== clientFilter) return false;
      if (
        assigneeFilter !== ALL &&
        !t.assignees.some((a) => a.id === assigneeFilter)
      )
        return false;
      if (statusFilter !== ALL && t.status !== statusFilter) return false;
      if (typeFilter !== ALL && t.typeContent !== typeFilter) return false;
      if (monthFilter !== ALL && taskMonth(t) !== monthFilter) return false;
      return true;
    });
  }, [tasks, clientFilter, assigneeFilter, statusFilter, typeFilter, monthFilter]);

  const filtered = scoped;

  // Bundle by brand (client), then by the chosen sort within each brand;
  // sub-tasks stay directly under their parent. `firstOfBrand` draws a divider
  // between brands; `firstOfType` draws one between content-type groups when
  // sorting "Per jenis konten" (#12 View Per Content Per Brand).
  const ordered = useMemo(() => {
    const cmp = makeCmp(sortKey);
    const visibleIds = new Set(filtered.map((t) => t.id));
    const roots = filtered
      .filter((t) => !t.parentId || !visibleIds.has(t.parentId))
      .sort((a, b) => a.clientName.localeCompare(b.clientName) || cmp(a, b));
    const out: {
      task: TaskRow;
      depth: number;
      firstOfBrand: boolean;
      firstOfType: boolean;
    }[] = [];
    let prevBrand: string | null = null;
    let prevType: TaskRow["typeContent"] | undefined;
    for (const root of roots) {
      const firstOfBrand = root.clientName !== prevBrand;
      if (firstOfBrand) prevType = undefined;
      const firstOfType =
        sortKey === "content" && !firstOfBrand && root.typeContent !== prevType;
      prevBrand = root.clientName;
      prevType = root.typeContent;
      out.push({ task: root, depth: 0, firstOfBrand, firstOfType });
      const children = filtered
        .filter((t) => t.parentId === root.id)
        .sort(cmp);
      for (const child of children) {
        out.push({ task: child, depth: 1, firstOfBrand: false, firstOfType: false });
      }
    }
    return out;
  }, [filtered, sortKey]);

  // Board reuses the same sort (brand-grouped) so cards order consistently.
  const boardTasks = useMemo(() => {
    const cmp = makeCmp(sortKey);
    return [...scoped].sort(
      (a, b) => a.clientName.localeCompare(b.clientName) || cmp(a, b),
    );
  }, [scoped, sortKey]);

  // Drag-to-reorder table rows within a brand (Notion-style). Only root rows
  // are draggable (via the grip); sub-tasks stay pinned under their parent.
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function handleReorderDrop(targetId: string) {
    const id = dragId;
    setDragId(null);
    setOverId(null);
    if (!id || id === targetId) return;
    const src = tasks.find((t) => t.id === id);
    const tgt = tasks.find((t) => t.id === targetId);
    if (!src || !tgt || src.clientId !== tgt.clientId) return;
    const brandRoots = ordered
      .filter((o) => o.depth === 0 && o.task.clientId === src.clientId)
      .map((o) => o.task.id);
    const from = brandRoots.indexOf(id);
    const to = brandRoots.indexOf(targetId);
    if (from < 0 || to < 0) return;
    brandRoots.splice(from, 1);
    brandRoots.splice(to, 0, id);
    startTransition(async () => {
      const r = await reorderTasks(brandRoots);
      if (r.ok) router.refresh();
      else toast.error(r.error);
    });
  }

  async function shareCopy(t: TaskRow) {
    try {
      await navigator.clipboard.writeText(taskShareText(t));
      toast.success("Ringkasan task disalin");
    } catch {
      toast.error("Gagal menyalin");
    }
  }
  function shareWhatsApp(t: TaskRow) {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(taskShareText(t))}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

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
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? ALL)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Jenis konten">
              {(v) =>
                v === ALL
                  ? "Semua jenis"
                  : (TYPE_CONTENT_MAP[v as string]?.label ?? "Jenis")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Semua jenis</SelectItem>
            {TYPE_CONTENTS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
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
        <Select value={sortKey} onValueChange={(v) => setSortKey((v as SortKey) ?? "manual")}>
          <SelectTrigger className="w-44">
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <SelectValue placeholder="Urutkan">
              {(v) => SORTS.find((s) => s.value === v)?.label ?? "Urutkan"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
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

      {view === "board" && (
        <TasksBoard
          tasks={boardTasks}
          onOpen={openDetail}
          onChanged={() => router.refresh()}
        />
      )}
      {view === "calendar" && (
        <TasksCalendar
          tasks={scoped}
          month={monthFilter === ALL ? currentMonth : monthFilter}
          onMonthChange={setMonthFilter}
          onOpen={openDetail}
          onChanged={() => router.refresh()}
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
              ordered.map(({ task: t, depth, firstOfBrand, firstOfType }) => (
                <TableRow
                  key={t.id}
                  onDragOver={(e) => {
                    if (sortKey !== "manual" || !dragId || depth > 0) return;
                    const src = tasks.find((x) => x.id === dragId);
                    if (!src || src.clientId !== t.clientId) return;
                    e.preventDefault();
                    setOverId(t.id);
                  }}
                  onDrop={() =>
                    sortKey === "manual" && depth === 0 && handleReorderDrop(t.id)
                  }
                  className={cn(
                    firstOfBrand && "border-t-2 border-t-border",
                    firstOfType && "border-t border-dashed border-t-border",
                    dragId === t.id && "opacity-50",
                    overId === t.id && "outline outline-2 -outline-offset-2 outline-primary/50",
                  )}
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
                      {depth === 0 && sortKey === "manual" && (
                        <span
                          draggable
                          onDragStart={(e) => {
                            setDragId(t.id);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={() => {
                            setDragId(null);
                            setOverId(null);
                          }}
                          className="shrink-0 cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
                          title="Geser untuk atur urutan"
                          aria-label="Geser untuk atur urutan"
                        >
                          <GripVertical className="size-3.5" />
                        </span>
                      )}
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
                      {t.typeContent && TYPE_CONTENT_MAP[t.typeContent] && (
                        <span
                          className={cn(
                            "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                            TYPE_CONTENT_MAP[t.typeContent].badge,
                          )}
                        >
                          {TYPE_CONTENT_MAP[t.typeContent].label}
                        </span>
                      )}
                      {t.linkMateri && (
                        <a
                          href={t.linkMateri}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 text-muted-foreground hover:text-primary"
                          title="Buka link materi"
                          aria-label="Buka link materi"
                        >
                          <Link2 className="size-3.5" />
                        </a>
                      )}
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
                        <DropdownMenuItem onClick={() => shareCopy(t)}>
                          <Share2 className="size-4" />
                          Bagikan (salin)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => shareWhatsApp(t)}>
                          <MessageCircle className="size-4" />
                          Kirim ke WhatsApp
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
