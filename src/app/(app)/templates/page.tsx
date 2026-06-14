import { asc } from "drizzle-orm";
import { db } from "@/db";
import { client } from "@/db/schema";
import { jakartaParts } from "@/lib/tz";
import { listTemplates } from "./actions";
import { TemplatesView } from "./templates-view";

export const dynamic = "force-dynamic";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const sp = await searchParams;
  const clients = await db
    .select({ id: client.id, name: client.name })
    .from(client)
    .orderBy(asc(client.name));

  const selectedClientId =
    sp.client && clients.some((c) => c.id === sp.client)
      ? sp.client
      : (clients[0]?.id ?? null);

  const templates = selectedClientId
    ? await listTemplates(selectedClientId)
    : [];

  const now = jakartaParts();
  const month = `${now.year}-${String(now.month).padStart(2, "0")}`;

  return (
    <TemplatesView
      clients={clients}
      selectedClientId={selectedClientId}
      templates={templates}
      defaultMonth={month}
    />
  );
}
