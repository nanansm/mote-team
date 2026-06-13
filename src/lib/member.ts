import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { teamMember } from "@/db/schema";

/** Resolve the team_member profile for a logged-in user (by auth link or email). */
export async function getMemberFor(user: {
  id: string;
  email: string;
}): Promise<typeof teamMember.$inferSelect | null> {
  const [m] = await db
    .select()
    .from(teamMember)
    .where(or(eq(teamMember.authUserId, user.id), eq(teamMember.email, user.email)))
    .limit(1);
  return m ?? null;
}
