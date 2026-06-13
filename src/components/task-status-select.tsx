"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { updateTaskStatus } from "@/app/(app)/tasks/actions";
import { TASK_STATUSES, TASK_STATUS_MAP, type TaskStatus } from "@/lib/task-meta";
import { cn } from "@/lib/utils";

/** Reusable inline status pill that updates a task's status. */
export function TaskStatusSelect({
  taskId,
  status,
}: {
  taskId: string;
  status: TaskStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const meta = TASK_STATUS_MAP[status];

  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(v) =>
        start(async () => {
          const r = await updateTaskStatus(taskId, (v ?? status) as TaskStatus);
          if (r.ok) router.refresh();
          else toast.error(r.error);
        })
      }
    >
      <SelectTrigger
        className={cn(
          "h-7 w-auto gap-1.5 rounded-full border-0 px-2.5 text-xs font-medium shadow-none transition-transform active:scale-95 focus-visible:ring-1",
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
