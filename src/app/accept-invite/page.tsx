import { and, eq, gt, isNull } from "drizzle-orm";
import { Wordmark } from "@/components/brand";
import { db } from "@/db";
import { invitation } from "@/db/schema";
import { AcceptForm } from "./accept-form";

export const dynamic = "force-dynamic";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let invite: { email: string } | null = null;
  if (token) {
    const [inv] = await db
      .select({ email: invitation.email })
      .from(invitation)
      .where(
        and(
          eq(invitation.token, token),
          isNull(invitation.acceptedAt),
          gt(invitation.expiresAt, new Date()),
        ),
      )
      .limit(1);
    invite = inv ?? null;
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Wordmark height={26} />
          <h1 className="text-lg font-semibold tracking-tight">
            Terima undangan
          </h1>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {invite ? (
            <AcceptForm token={token!} email={invite.email} />
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Undangan tidak valid atau sudah kadaluarsa. Hubungi admin untuk
              undangan baru.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
