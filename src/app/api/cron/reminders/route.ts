import { and, eq, isNotNull, lte, notInArray } from "drizzle-orm";
import { db } from "@/db";
import { client, task, taskAssignee, teamMember, user } from "@/db/schema";
import { env } from "@/lib/env";
import { deadlineReminderEmail, isMailerConfigured, sendMail } from "@/lib/mailer";
import { ymdOffset } from "@/lib/tz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deadline reminder job. Trigger daily via external cron:
 *   GET /api/cron/reminders?secret=CRON_SECRET
 * Emails each assignee the tasks of theirs that are due tomorrow or overdue and
 * not yet done/published.
 */
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!env.CRON_SECRET || secret !== env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!isMailerConfigured()) {
    return Response.json({ ok: false, error: "SMTP not configured" });
  }

  const tomorrow = ymdOffset(1); // WIB calendar day

  const rows = await db
    .select({
      title: task.title,
      dueDate: task.dueDate,
      clientName: client.name,
      memberName: teamMember.name,
      email: teamMember.email,
      userEmail: user.email,
    })
    .from(task)
    .innerJoin(taskAssignee, eq(taskAssignee.taskId, task.id))
    .innerJoin(teamMember, eq(taskAssignee.teamMemberId, teamMember.id))
    .leftJoin(user, eq(teamMember.authUserId, user.id))
    .leftJoin(client, eq(task.clientId, client.id))
    .where(
      and(
        isNotNull(task.dueDate),
        lte(task.dueDate, tomorrow),
        notInArray(task.status, ["done", "published"]),
      ),
    );

  // Group by recipient email.
  const byEmail = new Map<
    string,
    { name: string; tasks: { title: string; clientName: string; dueDate: string | null }[] }
  >();
  for (const r of rows) {
    const email = r.email ?? r.userEmail;
    if (!email) continue;
    const entry = byEmail.get(email) ?? { name: r.memberName, tasks: [] };
    entry.tasks.push({
      title: r.title,
      clientName: r.clientName ?? "—",
      dueDate: r.dueDate,
    });
    byEmail.set(email, entry);
  }

  let sent = 0;
  for (const [email, data] of byEmail) {
    const ok = await sendMail({
      to: email,
      subject: `⏰ ${data.tasks.length} task mendekati deadline`,
      html: deadlineReminderEmail({
        name: data.name,
        tasks: data.tasks,
        url: `${env.APP_URL}/tasks`,
      }),
    });
    if (ok) sent++;
  }

  return Response.json({ ok: true, recipients: byEmail.size, sent });
}
