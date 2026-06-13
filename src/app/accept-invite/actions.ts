"use server";

import { headers } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { invitation, teamMember } from "@/db/schema";
import { auth } from "@/lib/auth";

export type AcceptResult = { ok: true } | { ok: false; error: string };

export async function acceptInvite(input: {
  token: string;
  name: string;
  password: string;
}): Promise<AcceptResult> {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Nama wajib diisi." };
  if (input.password.length < 8)
    return { ok: false, error: "Password minimal 8 karakter." };

  const [inv] = await db
    .select()
    .from(invitation)
    .where(
      and(
        eq(invitation.token, input.token),
        isNull(invitation.acceptedAt),
        gt(invitation.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!inv) {
    return { ok: false, error: "Undangan tidak valid atau sudah kadaluarsa." };
  }

  try {
    const res = await auth.api.signUpEmail({
      body: { email: inv.email, name, password: input.password },
      headers: await headers(),
    });
    await db
      .update(invitation)
      .set({ acceptedAt: new Date() })
      .where(eq(invitation.id, inv.id));
    await db
      .insert(teamMember)
      .values({ authUserId: res.user.id, name, active: true });
    return { ok: true };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Gagal membuat akun. Coba lagi.";
    return { ok: false, error: msg };
  }
}
