/** Shared, client-safe constants for task status & content type. */

export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "done"
  | "ready"
  | "scheduled"
  | "published";

export type TypeContent = "carousel" | "reels";

export const TASK_STATUSES: {
  value: TaskStatus;
  label: string;
  /** Tailwind classes for a soft status badge. */
  badge: string;
  dot: string;
}[] = [
  { value: "not_started", label: "Not started", badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-400/15 dark:text-zinc-300", dot: "bg-zinc-400" },
  { value: "in_progress", label: "In progress", badge: "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300", dot: "bg-blue-500" },
  { value: "done", label: "Done", badge: "bg-purple-100 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300", dot: "bg-purple-500" },
  { value: "ready", label: "Ready", badge: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300", dot: "bg-amber-500" },
  { value: "scheduled", label: "Scheduled", badge: "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300", dot: "bg-orange-500" },
  { value: "published", label: "Published", badge: "bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300", dot: "bg-green-600" },
];

export const TASK_STATUS_MAP = Object.fromEntries(
  TASK_STATUSES.map((s) => [s.value, s]),
) as Record<TaskStatus, (typeof TASK_STATUSES)[number]>;

export const TYPE_CONTENTS: { value: TypeContent; label: string }[] = [
  { value: "carousel", label: "Carousel" },
  { value: "reels", label: "Reels" },
];

/** Statuses counted as "selesai" for completion rollups. */
export const DONE_STATUSES: TaskStatus[] = ["done", "published"];

export function isDone(status: TaskStatus): boolean {
  return DONE_STATUSES.includes(status);
}
