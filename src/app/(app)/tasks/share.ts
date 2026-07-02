import { TASK_STATUS_MAP, type TaskStatus } from "@/lib/task-meta";
import type { TaskRow } from "./types";

function d(v: string | null): string | null {
  if (!v) return null;
  // Parse the stored YYYY-MM-DD as local calendar parts, not `new Date(v)`
  // (which is UTC midnight and shifts a day back in UTC-negative timezones).
  const [y, mo, da] = v.split("-").map(Number);
  if (!y || !mo || !da) return v;
  return new Date(y, mo - 1, da).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Plain-text task summary for sharing to a group (WhatsApp-friendly *bold*).
 * Includes an app deep-link so teammates can jump straight to the task.
 */
export function taskShareText(t: TaskRow): string {
  const L = [`*${t.title}*`, `Klien: ${t.clientName}`];
  L.push(`Status: ${TASK_STATUS_MAP[t.status as TaskStatus]?.label ?? t.status}`);
  const posting = d(t.postingDate);
  if (posting) L.push(`Posting: ${posting}`);
  const due = d(t.dueDate);
  if (due) L.push(`Due: ${due}`);
  if (t.linkMateri) L.push(`Materi: ${t.linkMateri}`);
  if (t.linkOutput) L.push(`Output: ${t.linkOutput}`);
  if (t.linkIg) L.push(`IG: ${t.linkIg}`);
  if (t.linkTiktok) L.push(`TikTok: ${t.linkTiktok}`);
  if (t.caption) L.push(`\n${t.caption}`);
  if (typeof window !== "undefined")
    L.push(`\n${window.location.origin}/tasks?task=${t.id}`);
  return L.join("\n");
}
