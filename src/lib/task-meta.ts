/** Shared, client-safe constants for task status & content type. */

export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "done"
  | "ready"
  | "scheduled"
  | "published";

export type TypeContent =
  | "ig_post"
  | "ig_slide"
  | "reels"
  | "ig_story"
  | "tiktok"
  | "document"
  | "other";

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

export const TYPE_CONTENTS: {
  value: TypeContent;
  label: string;
  badge: string;
  dot: string;
}[] = [
  { value: "ig_post", label: "IG Post", badge: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300", dot: "bg-rose-500" },
  { value: "ig_slide", label: "IG Slide", badge: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300", dot: "bg-violet-500" },
  { value: "reels", label: "Reels", badge: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-400/15 dark:text-fuchsia-300", dot: "bg-fuchsia-500" },
  { value: "ig_story", label: "IG Story", badge: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300", dot: "bg-amber-500" },
  { value: "tiktok", label: "TikTok", badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300", dot: "bg-cyan-500" },
  { value: "document", label: "Document", badge: "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300", dot: "bg-blue-500" },
  { value: "other", label: "Other", badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-400/15 dark:text-zinc-300", dot: "bg-zinc-400" },
];

// Label lookup incl. legacy "carousel" (pre-0021 rows) → shown as IG Slide.
export const TYPE_CONTENT_MAP: Record<string, (typeof TYPE_CONTENTS)[number]> = {
  ...Object.fromEntries(TYPE_CONTENTS.map((t) => [t.value, t])),
  carousel: TYPE_CONTENTS[1], // ig_slide
};

/** Statuses counted as "selesai" for completion rollups. */
export const DONE_STATUSES: TaskStatus[] = ["done", "published"];

export function isDone(status: TaskStatus): boolean {
  return DONE_STATUSES.includes(status);
}
