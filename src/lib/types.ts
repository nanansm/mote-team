import type { client } from "@/db/schema";

export type ClientRow = typeof client.$inferSelect;
export type ClientStatus = ClientRow["status"];
