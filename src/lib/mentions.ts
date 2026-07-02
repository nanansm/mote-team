import "server-only";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { chatMentionEmail, sendMail } from "@/lib/mailer";
import { isOnline } from "@/lib/realtime";

/** "@[Name](u:id)" → "@Name", "#[Title](t:id)" → "#Title" for email snippets. */
export function stripTokens(body: string): string {
  return body
    .replace(/@\[([^\]]+)\]\(u:[^)]+\)/g, "@$1")
    .replace(/#\[([^\]]+)\]\(t:[^)]+\)/g, "#$1");
}

/** Distinct user ids mentioned via `@[..](u:id)` tokens. */
export function mentionedUserIds(body: string): string[] {
  return [...new Set(Array.from(body.matchAll(/\(u:([^)]+)\)/g), (m) => m[1]))];
}

/**
 * Email everyone @-mentioned in `body` who is currently offline (online users
 * already get the realtime badge). Sender is always excluded. Shared by team
 * chat and task comments.
 */
export async function notifyMentions({
  body,
  senderId,
  senderName,
  subject,
  url,
}: {
  body: string;
  senderId: string;
  senderName: string;
  subject: string;
  url: string;
}) {
  const ids = mentionedUserIds(body).filter(
    (id) => id !== senderId && !isOnline(id),
  );
  if (ids.length === 0) return;
  const rows = await db
    .select({ email: user.email })
    .from(user)
    .where(inArray(user.id, ids));
  const emails = rows.map((r) => r.email).filter((e): e is string => Boolean(e));
  if (emails.length === 0) return;
  await sendMail({
    to: emails,
    subject,
    html: chatMentionEmail({
      fromName: senderName,
      snippet: stripTokens(body),
      url,
    }),
  });
}
