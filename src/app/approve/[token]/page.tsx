import { eq } from "drizzle-orm";
import { db } from "@/db";
import { client, task } from "@/db/schema";
import { Wordmark } from "@/components/brand";
import { ApprovalForm } from "./approval-form";

export const dynamic = "force-dynamic";

export default async function ApprovePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const rows = await db
    .select({
      id: task.id,
      title: task.title,
      caption: task.caption,
      mediaUrl: task.mediaUrl,
      typeContent: task.typeContent,
      postingDate: task.postingDate,
      approvalStatus: task.approvalStatus,
      approvalNote: task.approvalNote,
      clientName: client.name,
    })
    .from(task)
    .leftJoin(client, eq(task.clientId, client.id))
    .where(eq(task.approvalToken, token))
    .limit(1);

  const t = rows[0];

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 py-10">
      <Wordmark height={22} />
      {!t ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
          Link approval tidak valid atau sudah kedaluwarsa.
        </div>
      ) : (
        <div className="space-y-5 rounded-xl border bg-card p-6 shadow-card">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Approval konten · {t.clientName ?? "—"}
            </p>
            <h1 className="mt-1 text-lg font-semibold">{t.title}</h1>
            {t.postingDate && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Rencana posting: {t.postingDate}
              </p>
            )}
          </div>

          {t.mediaUrl && !t.mediaUrl.startsWith("/api/") && (
            // Auth-gated proxy URLs (/api/r2/…) can't load on this public page;
            // only render publicly-reachable media.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t.mediaUrl}
              alt=""
              className="max-h-80 w-full rounded-lg border object-cover"
            />
          )}

          {t.caption && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Caption
              </p>
              <p className="whitespace-pre-wrap text-sm">{t.caption}</p>
            </div>
          )}

          <ApprovalForm
            token={token}
            status={t.approvalStatus}
            note={t.approvalNote}
          />
        </div>
      )}
    </main>
  );
}
