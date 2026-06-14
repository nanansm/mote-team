"use server";

import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { invitation, teamMember, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { requireAdmin } from "@/lib/session";

const inviteInput = z.object({
  email: z.email("Email tidak valid"),
  role: z.enum(["member", "admin"]),
});

export type InviteResult =
  | { ok: true; link: string }
  | { ok: false; error: string };

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createInvitation(raw: {
  email: string;
  role: "member" | "admin";
}): Promise<InviteResult> {
  const session = await requireAdmin();
  const parsed = inviteInput.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const email = parsed.data.email.toLowerCase();
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

  await db.insert(invitation).values({
    email,
    role: parsed.data.role,
    token,
    invitedBy: session.user.id,
    expiresAt,
  });

  revalidatePath("/team");
  const link = `${env.BETTER_AUTH_URL}/accept-invite?token=${token}`;
  return { ok: true, link };
}

export async function revokeInvitation(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  await db.delete(invitation).where(eq(invitation.id, id));
  revalidatePath("/team");
  return { ok: true };
}

/* ----------------------------------------------------- member directory */

const DIVISIONS = ["performance", "creative", "growth", "business"] as const;

const memberInput = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi"),
  email: z.union([z.email("Email tidak valid"), z.literal("")]).optional(),
  role: z.string().trim().optional(),
  division: z.union([z.enum(DIVISIONS), z.literal("")]).optional(),
  code: z.string().trim().optional(),
  reportsTo: z.string().trim().optional(),
});

export type MemberInput = z.infer<typeof memberInput>;
export type SimpleResult = { ok: true } | { ok: false; error: string };

function memberValues(input: MemberInput) {
  return {
    name: input.name,
    email: input.email ? input.email.toLowerCase() : null,
    role: input.role ? input.role : null,
    division: input.division ? input.division : null,
    code: input.code ? input.code : null,
    reportsTo: input.reportsTo ? input.reportsTo : null,
  };
}

export async function createMember(raw: MemberInput): Promise<SimpleResult> {
  await requireAdmin();
  const parsed = memberInput.safeParse(raw);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  await db.insert(teamMember).values({ ...memberValues(parsed.data), active: true });
  revalidatePath("/team");
  return { ok: true };
}

export async function updateMember(
  id: string,
  raw: MemberInput,
): Promise<SimpleResult> {
  await requireAdmin();
  const parsed = memberInput.safeParse(raw);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  await db
    .update(teamMember)
    .set({ ...memberValues(parsed.data), updatedAt: new Date() })
    .where(eq(teamMember.id, id));
  revalidatePath("/team");
  return { ok: true };
}

export async function setMemberActive(
  id: string,
  active: boolean,
): Promise<SimpleResult> {
  await requireAdmin();
  await db
    .update(teamMember)
    .set({ active, updatedAt: new Date() })
    .where(eq(teamMember.id, id));
  revalidatePath("/team");
  return { ok: true };
}

/** Invite a member that has an email but no account yet. */
export async function inviteMember(
  id: string,
  role: "member" | "admin" = "member",
): Promise<InviteResult> {
  const session = await requireAdmin();
  const [m] = await db
    .select({ email: teamMember.email })
    .from(teamMember)
    .where(eq(teamMember.id, id))
    .limit(1);
  if (!m?.email)
    return { ok: false, error: "Anggota belum punya email. Isi email dulu." };

  const email = m.email.toLowerCase();
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  await db.insert(invitation).values({
    email,
    role,
    token,
    invitedBy: session.user.id,
    expiresAt,
  });
  revalidatePath("/team");
  return { ok: true, link: `${env.BETTER_AUTH_URL}/accept-invite?token=${token}` };
}

/** Send a password-reset email to the member's account. */
export async function sendMemberReset(id: string): Promise<SimpleResult> {
  await requireAdmin();
  const [m] = await db
    .select({ email: teamMember.email })
    .from(teamMember)
    .where(eq(teamMember.id, id))
    .limit(1);
  if (!m?.email) return { ok: false, error: "Anggota belum punya email." };
  try {
    await auth.api.requestPasswordReset({
      body: { email: m.email.toLowerCase(), redirectTo: "/reset-password" },
      headers: await headers(),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal kirim reset." };
  }
}

/** Permanently delete a member (and their login account, if any). Their task
 *  assignments are removed (FK cascade); created-by references are nulled. */
export async function deleteMember(id: string): Promise<SimpleResult> {
  const session = await requireAdmin();
  const [m] = await db
    .select({ authUserId: teamMember.authUserId, email: teamMember.email })
    .from(teamMember)
    .where(eq(teamMember.id, id))
    .limit(1);
  if (!m) return { ok: false, error: "Anggota tidak ditemukan." };

  // Guard: don't let an admin delete their own profile.
  if (m.authUserId && m.authUserId === session.user.id)
    return { ok: false, error: "Tidak bisa menghapus akun sendiri." };

  await db.delete(teamMember).where(eq(teamMember.id, id));
  // Best-effort: remove the linked login account too (orphan otherwise).
  const targetEmail = m.email?.toLowerCase();
  try {
    if (m.authUserId) await db.delete(user).where(eq(user.id, m.authUserId));
    else if (targetEmail) await db.delete(user).where(eq(user.email, targetEmail));
  } catch {
    /* leave the auth account if FK constraints block it */
  }
  revalidatePath("/team");
  return { ok: true };
}

/** Promote/demote a member's login account between admin and member. */
export async function setMemberRole(
  id: string,
  role: "admin" | "member",
): Promise<SimpleResult> {
  await requireAdmin();
  const [m] = await db
    .select({ authUserId: teamMember.authUserId, email: teamMember.email })
    .from(teamMember)
    .where(eq(teamMember.id, id))
    .limit(1);
  if (!m) return { ok: false, error: "Anggota tidak ditemukan." };
  const email = m.email?.toLowerCase() ?? null;
  if (!m.authUserId && !email)
    return { ok: false, error: "Anggota belum punya akun." };

  const res = await db
    .update(user)
    .set({ role })
    .where(
      m.authUserId && email
        ? or(eq(user.id, m.authUserId), eq(user.email, email))
        : m.authUserId
          ? eq(user.id, m.authUserId)
          : eq(user.email, email!),
    )
    .returning({ id: user.id });
  if (res.length === 0)
    return { ok: false, error: "Akun belum aktif — anggota belum menerima undangan." };
  revalidatePath("/team");
  return { ok: true };
}
