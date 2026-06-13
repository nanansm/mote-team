import { asc, desc, eq } from "drizzle-orm";
import { client, okr } from "@/db/schema";
import { db } from "@/db";
import { OkrView } from "./okr-view";

export default async function OkrPage() {
  const [rows, clients] = await Promise.all([
    db
      .select({
        id: okr.id,
        objective: okr.objective,
        keyResult: okr.keyResult,
        clientId: okr.clientId,
        clientName: client.name,
        period: okr.period,
        target: okr.target,
        progress: okr.progress,
      })
      .from(okr)
      .leftJoin(client, eq(okr.clientId, client.id))
      .orderBy(desc(okr.period), asc(okr.objective)),
    db
      .select({ id: client.id, name: client.name })
      .from(client)
      .orderBy(asc(client.name)),
  ]);

  const okrs = rows.map((r) => ({
    id: r.id,
    objective: r.objective,
    keyResult: r.keyResult,
    clientId: r.clientId,
    clientName: r.clientName,
    period: r.period ?? "",
    target: Number(r.target ?? 0),
    progress: Number(r.progress ?? 0),
  }));

  return <OkrView okrs={okrs} clients={clients} />;
}
