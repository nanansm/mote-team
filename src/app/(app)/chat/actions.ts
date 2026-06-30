"use server";

import { and, asc, desc, eq, gt, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { chatMessage, client, task, user } from "@/db/schema";
import { env } from "@/lib/env";
import { chatMentionEmail, sendMail } from "@/lib/mailer";
import { isOnline, publish, type ChatMessage } from "@/lib/realtime";
import { requireSession } from "@/lib/session";

const MAX_LEN = 2000;

export type ChatMember = { userId: string; name: string; image: string | null };
export type ChatTask = { id: string; title: string; clientName: string };

/** Tasks that can be #-mentioned in chat (id + title, newest first). */
export async function listMentionableTasks(): Promise<ChatTask[]> {
  await requireSession();
  const rows = await db
    .select({ id: task.id, title: task.title, clientName: client.name })
    .from(task)
    .leftJoin(client, eq(task.clientId, client.id))
    .orderBy(desc(task.createdAt))
    .limit(500);
  return rows.map((r) => ({ ...r, clientName: r.clientName ?? "—" }));
}

/** Members that can be @-mentioned (everyone with a login). */
export async function listChatMembers(): Promise<ChatMember[]> {
  await requireSession();
  const rows = await db
    .select({ userId: user.id, name: user.name, image: user.image })
    .from(user)
    .orderBy(asc(user.name));
  return rows.map((r) => ({ ...r, image: r.image ?? null }));
}

/**
 * How many messages mention me since `sinceIso` (drives the red tag badge).
 * A mention = the body contains "@<my display name>". Excludes my own messages.
 */
export async function unreadMentionCount(
  sinceIso: string | null,
): Promise<number> {
  const session = await requireSession();
  const since = sinceIso ? new Date(sinceIso) : new Date(0);
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(chatMessage)
    .where(
      and(
        gt(chatMessage.createdAt, since),
        ne(chatMessage.userId, session.user.id),
        or(
          // new structured mention token …
          ilike(chatMessage.body, `%(u:${session.user.id})%`),
          // … and legacy plain "@Name" messages.
          ilike(chatMessage.body, `%@${session.user.name}%`),
        ),
      ),
    );
  return row?.n ?? 0;
}

/** Recent messages, oldest→newest (chat scroll order). */
export async function listMessages(limit = 80): Promise<ChatMessage[]> {
  await requireSession();
  // Take the newest `limit`, then return ascending.
  const rows = await db
    .select({
      id: chatMessage.id,
      userId: chatMessage.userId,
      body: chatMessage.body,
      createdAt: chatMessage.createdAt,
      name: user.name,
      image: user.image,
    })
    .from(chatMessage)
    .leftJoin(user, eq(chatMessage.userId, user.id))
    .orderBy(asc(chatMessage.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId ?? "",
    name: r.name ?? "Anggota",
    image: r.image ?? null,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function sendMessage(
  body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Pesan kosong" };
  if (trimmed.length > MAX_LEN)
    return { ok: false, error: "Pesan terlalu panjang" };

  const [row] = await db
    .insert(chatMessage)
    .values({ userId: session.user.id, body: trimmed })
    .returning({ id: chatMessage.id, createdAt: chatMessage.createdAt });

  // Push to all connected tabs instantly (in-process SSE bus).
  publish({
    type: "message",
    message: {
      id: row.id,
      userId: session.user.id,
      name: session.user.name,
      image: session.user.image ?? null,
      body: trimmed,
      createdAt: row.createdAt.toISOString(),
    },
  });

  // Email anyone @-mentioned who is currently offline (online users already
  // see the realtime red badge, so emailing them would just be noise).
  await notifyMentions(trimmed, session.user.id, session.user.name).catch(
    (e) => console.error("[chat] mention email failed:", e),
  );
  return { ok: true };
}

/** "@[Name](u:id)" → "@Name", "#[Title](t:id)" → "#Title" for email snippets. */
function stripTokens(body: string): string {
  return body
    .replace(/@\[([^\]]+)\]\(u:[^)]+\)/g, "@$1")
    .replace(/#\[([^\]]+)\]\(t:[^)]+\)/g, "#$1");
}

async function notifyMentions(body: string, senderId: string, senderName: string) {
  const ids = [...new Set(Array.from(body.matchAll(/\(u:([^)]+)\)/g), (m) => m[1]))]
    .filter((id) => id !== senderId && !isOnline(id));
  if (ids.length === 0) return;
  const rows = await db
    .select({ email: user.email })
    .from(user)
    .where(inArray(user.id, ids));
  const emails = rows.map((r) => r.email).filter((e): e is string => Boolean(e));
  if (emails.length === 0) return;
  await sendMail({
    to: emails,
    subject: `${senderName} menyebutmu di Chat Tim`,
    html: chatMentionEmail({
      fromName: senderName,
      snippet: stripTokens(body),
      url: `${env.APP_URL}/`,
    }),
  });
}
