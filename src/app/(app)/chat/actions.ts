"use server";

import { and, asc, eq, gt, ilike, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { chatMessage, user } from "@/db/schema";
import { publish, type ChatMessage } from "@/lib/realtime";
import { requireSession } from "@/lib/session";

const MAX_LEN = 2000;

export type ChatMember = { userId: string; name: string; image: string | null };

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
        ilike(chatMessage.body, `%@${session.user.name}%`),
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
  return { ok: true };
}
