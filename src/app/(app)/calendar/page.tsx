import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { client, task } from "@/db/schema";
import { getHolidays } from "@/lib/holidays";
import type { TaskStatus, TypeContent } from "@/lib/task-meta";
import { jakartaParts, todayJakarta } from "@/lib/tz";
import { CalendarView } from "./calendar-view";

export const dynamic = "force-dynamic";

/** Last day-of-month as YYYY-MM-DD (local Date math is tz-independent for a fixed Y/M). */
function lastOfMonth(year: number, month: number): string {
  const day = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export type CalendarTask = {
  id: string;
  title: string;
  status: TaskStatus;
  postingDate: string;
  typeContent: TypeContent | null;
  caption: string | null;
  mediaUrl: string | null;
  linkOutput: string | null;
  linkIg: string | null;
  linkTiktok: string | null;
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; m?: string }>;
}) {
  const sp = await searchParams;
  const clients = await db
    .select({ id: client.id, name: client.name })
    .from(client)
    .where(eq(client.status, "active"))
    .orderBy(asc(client.name));

  // Selected month: ?m=YYYY-MM, default current Jakarta month.
  const now = jakartaParts();
  const month =
    sp.m && /^\d{4}-\d{2}$/.test(sp.m)
      ? sp.m
      : `${now.year}-${String(now.month).padStart(2, "0")}`;
  const [y, m] = month.split("-").map(Number);
  const first = `${month}-01`;
  const last = lastOfMonth(y, m);

  // Libur nasional + momen konten untuk tahun yang ditampilkan (overlay).
  const holidays = await getHolidays(y);

  // Selected client: ?client=id, default first client.
  const selectedClientId =
    sp.client && clients.some((c) => c.id === sp.client)
      ? sp.client
      : (clients[0]?.id ?? null);

  let tasks: CalendarTask[] = [];
  if (selectedClientId) {
    tasks = await db
      .select({
        id: task.id,
        title: task.title,
        status: task.status,
        postingDate: task.postingDate,
        typeContent: task.typeContent,
        caption: task.caption,
        mediaUrl: task.mediaUrl,
        linkOutput: task.linkOutput,
        linkIg: task.linkIg,
        linkTiktok: task.linkTiktok,
      })
      .from(task)
      .where(
        and(
          eq(task.clientId, selectedClientId),
          gte(task.postingDate, first),
          lte(task.postingDate, last),
        ),
      )
      .orderBy(asc(task.postingDate))
      .then((rows) =>
        rows
          .filter((r): r is typeof r & { postingDate: string } => !!r.postingDate)
          .map((r) => ({
            ...r,
            status: r.status as TaskStatus,
            typeContent: r.typeContent as TypeContent | null,
          })),
      );
  }

  return (
    <CalendarView
      clients={clients}
      selectedClientId={selectedClientId}
      month={month}
      tasks={tasks}
      today={todayJakarta()}
      holidays={holidays}
    />
  );
}
