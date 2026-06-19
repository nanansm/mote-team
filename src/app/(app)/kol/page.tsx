import { and, asc, eq, inArray } from "drizzle-orm";
import { PageHeader } from "@/components/page-header";
import { db } from "@/db";
import { client, kolActivation } from "@/db/schema";
import { aggregateKol, topKolPosts, withComputed } from "@/lib/kol";
import { jakartaParts } from "@/lib/tz";
import { KolView } from "./kol-view";

export const dynamic = "force-dynamic";

const ALL = "all";

function currentMonth(): string {
  const { year, month } = jakartaParts();
  return `${year}-${String(month).padStart(2, "0")}`;
}

export default async function KolPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; period?: string }>;
}) {
  const sp = await searchParams;
  const period =
    sp.period === ALL
      ? ALL
      : /^\d{4}-\d{2}$/.test(sp.period ?? "")
        ? sp.period!
        : currentMonth();

  // Active clients only.
  const clients = await db
    .select({ id: client.id, name: client.name })
    .from(client)
    .where(eq(client.status, "active"))
    .orderBy(asc(client.name));

  // Default "Semua Klien"; only honor a specific client if it's active.
  const selectedClient =
    sp.client && clients.some((c) => c.id === sp.client) ? sp.client : ALL;

  const clientIds = clients.map((c) => c.id);
  const scopeIds = selectedClient === ALL ? clientIds : [selectedClient];

  const conds = [inArray(kolActivation.clientId, scopeIds)];
  if (period !== ALL) conds.push(eq(kolActivation.period, period));

  const rows = scopeIds.length
    ? await db
        .select()
        .from(kolActivation)
        .where(and(...conds))
        .orderBy(asc(kolActivation.username))
    : [];

  const clientNames = Object.fromEntries(clients.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="KOL Activation"
        description="Input & performa kolaborasi KOL per klien per bulan"
      />
      <KolView
        clients={clients}
        clientNames={clientNames}
        selectedClient={selectedClient}
        period={period}
        nowMonth={currentMonth()}
        rows={withComputed(rows)}
        aggregate={aggregateKol(rows)}
        topPosts={topKolPosts(rows)}
      />
    </div>
  );
}
