import { and, eq, inArray, isNotNull, lte, notInArray } from "drizzle-orm";
import { db } from "@/db";
import {
  client,
  kolActivation,
  task,
  taskAssignee,
  teamMember,
  user,
} from "@/db/schema";
import { env } from "@/lib/env";
import { deadlineReminderEmail, isMailerConfigured, sendMail } from "@/lib/mailer";
import {
  deadlineReminderWa,
  isWhatsAppConfigured,
  kolStaleWa,
  sendWhatsApp,
} from "@/lib/whatsapp";
import { KOL_STATUS_LABEL } from "@/lib/kol";
import { ymdOffset } from "@/lib/tz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Outreach statuses where a KOL going quiet for days = a dropped follow-up.
const KOL_OUTREACH = [
  "belum_bales_dm",
  "sudah_bales_dm",
  "minta_rate_card",
  "nego",
] as const;
const KOL_STALE_DAYS = 3;

/**
 * Deadline reminder job. Trigger daily via external cron:
 *   GET /api/cron/reminders?secret=CRON_SECRET
 * Notifies each assignee (email + WhatsApp, whichever is configured) about
 * their tasks due tomorrow or overdue and not yet done/published.
 */
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!env.CRON_SECRET || secret !== env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const mailerOn = isMailerConfigured();
  const waOn = await isWhatsAppConfigured();
  if (!mailerOn && !waOn) {
    return Response.json({ ok: false, error: "No channel configured (SMTP/WhatsApp)" });
  }

  const tomorrow = ymdOffset(1); // WIB calendar day

  const rows = await db
    .select({
      title: task.title,
      dueDate: task.dueDate,
      clientName: client.name,
      memberId: teamMember.id,
      memberName: teamMember.name,
      email: teamMember.email,
      phone: teamMember.phone,
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

  // Group by assignee (member) so each gets one email + one WhatsApp digest.
  const byMember = new Map<
    string,
    {
      name: string;
      email: string | null;
      phone: string | null;
      tasks: { title: string; clientName: string; dueDate: string | null }[];
    }
  >();
  for (const r of rows) {
    const entry = byMember.get(r.memberId) ?? {
      name: r.memberName,
      email: r.email ?? r.userEmail ?? null,
      phone: r.phone,
      tasks: [],
    };
    entry.tasks.push({
      title: r.title,
      clientName: r.clientName ?? "—",
      dueDate: r.dueDate,
    });
    byMember.set(r.memberId, entry);
  }

  const url = `${env.APP_URL}/tasks`;
  let emailsSent = 0;
  let waSent = 0;
  for (const data of byMember.values()) {
    if (mailerOn && data.email) {
      const ok = await sendMail({
        to: data.email,
        subject: `⏰ ${data.tasks.length} task mendekati deadline`,
        html: deadlineReminderEmail({ name: data.name, tasks: data.tasks, url }),
      });
      if (ok) emailsSent++;
    }
    if (waOn && data.phone) {
      const ok = await sendWhatsApp(
        data.phone,
        await deadlineReminderWa({ name: data.name, tasks: data.tasks, url }),
      );
      if (ok) waSent++;
    }
  }

  // --- Stale KOL outreach digest (WhatsApp only) -------------------------
  // KOLs stuck in an outreach status with no update for KOL_STALE_DAYS get
  // surfaced to the performance/growth team so follow-ups don't get dropped.
  let kolWaSent = 0;
  let staleKolCount = 0;
  if (waOn) {
    const staleBefore = new Date(Date.now() - KOL_STALE_DAYS * 86_400_000);
    const staleKols = await db
      .select({
        username: kolActivation.username,
        status: kolActivation.status,
        updatedAt: kolActivation.updatedAt,
        clientName: client.name,
      })
      .from(kolActivation)
      .leftJoin(client, eq(kolActivation.clientId, client.id))
      .where(
        and(
          inArray(kolActivation.status, KOL_OUTREACH),
          lte(kolActivation.updatedAt, staleBefore),
        ),
      );
    staleKolCount = staleKols.length;

    if (staleKols.length > 0) {
      const kols = staleKols.map((k) => ({
        username: k.username,
        clientName: k.clientName ?? "—",
        status: KOL_STATUS_LABEL[k.status],
        days: Math.floor((Date.now() - k.updatedAt.getTime()) / 86_400_000),
      }));
      // Recipients: active performance/growth members with a phone.
      const handlers = await db
        .select({ name: teamMember.name, phone: teamMember.phone })
        .from(teamMember)
        .where(
          and(
            eq(teamMember.active, true),
            isNotNull(teamMember.phone),
            inArray(teamMember.division, ["performance", "growth"]),
          ),
        );
      const url = `${env.APP_URL}/kol`;
      for (const h of handlers) {
        if (!h.phone) continue;
        const ok = await sendWhatsApp(
          h.phone,
          kolStaleWa({ name: h.name, kols, url }),
        );
        if (ok) kolWaSent++;
      }
    }
  }

  return Response.json({
    ok: true,
    recipients: byMember.size,
    emailsSent,
    waSent,
    staleKolCount,
    kolWaSent,
  });
}
