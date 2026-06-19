import { and, asc, eq } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { db } from "@/db";
import { client, offlineMetric } from "@/db/schema";
import { jakartaParts } from "@/lib/tz";
import { OfflineView } from "./offline-view";

export const dynamic = "force-dynamic";

function currentMonth(): string {
  const { year, month } = jakartaParts();
  return `${year}-${String(month).padStart(2, "0")}`;
}

export default async function OfflinePage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; period?: string }>;
}) {
  const sp = await searchParams;
  const period = /^\d{4}-\d{2}$/.test(sp.period ?? "")
    ? sp.period!
    : currentMonth();

  const clients = await db
    .select({ id: client.id, name: client.name })
    .from(client)
    .where(eq(client.status, "active"))
    .orderBy(asc(client.name));

  const selectedClient =
    clients.find((c) => c.id === sp.client)?.id ?? clients[0]?.id ?? "";

  const row = selectedClient
    ? (
        await db
          .select()
          .from(offlineMetric)
          .where(
            and(
              eq(offlineMetric.clientId, selectedClient),
              eq(offlineMetric.period, period),
            ),
          )
          .limit(1)
      )[0] ?? null
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Klien Revenue"
        description="Omset & metrik bulanan per klien — sumber Real Omset dashboard"
      />
      <OfflineView
        clients={clients}
        selectedClient={selectedClient}
        period={period}
        nowMonth={currentMonth()}
        row={row}
      />
    </div>
  );
}
