import { desc } from "drizzle-orm";
import { db } from "@/db";
import { client } from "@/db/schema";
import { ClientsView } from "./clients-view";

export default async function ClientsPage() {
  const clients = await db
    .select()
    .from(client)
    .orderBy(desc(client.createdAt));

  return <ClientsView clients={clients} />;
}
