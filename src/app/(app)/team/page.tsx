import { asc, desc, isNull } from "drizzle-orm";
import { db } from "@/db";
import { invitation, teamMember, user } from "@/db/schema";
import { env } from "@/lib/env";
import { requireAdmin } from "@/lib/session";
import { TeamView, type DirectoryMember } from "./team-view";

export default async function TeamPage() {
  await requireAdmin();

  const [members, users, pending] = await Promise.all([
    db
      .select({
        id: teamMember.id,
        code: teamMember.code,
        name: teamMember.name,
        email: teamMember.email,
        role: teamMember.role,
        division: teamMember.division,
        reportsTo: teamMember.reportsTo,
        active: teamMember.active,
      })
      .from(teamMember)
      .orderBy(asc(teamMember.code), asc(teamMember.name)),
    db.select({ email: user.email, role: user.role }).from(user),
    db
      .select({ email: invitation.email, token: invitation.token })
      .from(invitation)
      .where(isNull(invitation.acceptedAt))
      .orderBy(desc(invitation.createdAt)),
  ]);

  const roleByEmail = new Map(
    users.map((u) => [u.email.toLowerCase(), u.role ?? "member"]),
  );
  const pendingByEmail = new Map(
    pending.map((p) => [p.email.toLowerCase(), p.token]),
  );

  const directory: DirectoryMember[] = members.map((m) => {
    const email = m.email?.toLowerCase() ?? null;
    const accountRole = email ? (roleByEmail.get(email) ?? null) : null;
    const hasAccount = accountRole !== null;
    const pendingToken = email ? (pendingByEmail.get(email) ?? null) : null;
    return {
      ...m,
      account: hasAccount ? "active" : pendingToken ? "pending" : "none",
      accountRole: accountRole === "admin" ? "admin" : hasAccount ? "member" : null,
      inviteLink: pendingToken
        ? `${env.BETTER_AUTH_URL}/accept-invite?token=${pendingToken}`
        : null,
    };
  });

  return <TeamView directory={directory} />;
}
