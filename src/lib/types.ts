import type { client, kolActivation, offlineMetric } from "@/db/schema";

export type ClientRow = typeof client.$inferSelect;
export type ClientStatus = ClientRow["status"];

export type KolRow = typeof kolActivation.$inferSelect;
export type KolStatus = KolRow["status"];

export type OfflineRow = typeof offlineMetric.$inferSelect;
