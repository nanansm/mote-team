import {
  type AnyPgColumn,
  boolean,
  date,
  index,
  numeric,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { moteteam } from "./_base";
import { user } from "./auth";

/* ------------------------------------------------------------------ enums */

export const clientStatus = moteteam.enum("client_status", [
  "active",
  "on_hold",
  "offboarding",
]);

export const taskStatus = moteteam.enum("task_status", [
  "not_started",
  "in_progress",
  "done",
  "ready",
  "scheduled",
  "published",
]);

export const typeContent = moteteam.enum("type_content", ["carousel", "reels"]);

// Additive vs PRD: Notion Team Directory tracks division. Kept so we don't
// migrate again later (PRD 5.3 allows additive).
export const teamDivision = moteteam.enum("team_division", [
  "performance",
  "creative",
  "growth",
  "business",
]);

/* ----------------------------------------------------------------- tables */

export const client = moteteam.table("client", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  status: clientStatus("status").notNull().default("active"),
  contractEnd: date("contract_end"),
  logoUrl: text("logo_url"),
  // Windsor.ai account names (per platform) for pulling organic performance.
  windsorAccountId: text("windsor_account_id"), // Instagram account_name
  windsorTiktokId: text("windsor_tiktok_id"), // TikTok account_name
  // Meta Ads account id (without act_ prefix) for paid performance via Graph API.
  metaAdAccountId: text("meta_ad_account_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teamMember = moteteam.table("team_member", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: text("auth_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  email: text("email"), // for notifications (overrides linked auth user email)
  role: text("role"),
  // Additive vs PRD (see enum note).
  division: teamDivision("division"),
  active: boolean("active").notNull().default(true),
  grade: text("grade"),
  code: text("code"), // internal staff code, e.g. K001
  reportsTo: text("reports_to"), // head's name (reporting line)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const monthlyPerformance = moteteam.table("monthly_performance", {
  id: uuid("id").defaultRandom().primaryKey(),
  month: text("month").notNull(), // e.g. "2026-04"
  teamMemberId: uuid("team_member_id").references(() => teamMember.id, {
    onDelete: "cascade",
  }),
  scoreInitiative: numeric("score_initiative"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const task = moteteam.table("task", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  status: taskStatus("status").notNull().default("not_started"),
  clientId: uuid("client_id")
    .notNull()
    .references(() => client.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id").references((): AnyPgColumn => task.id, {
    onDelete: "cascade",
  }),
  dueDate: date("due_date"),
  postingDate: date("posting_date"),
  typeContent: typeContent("type_content"),
  caption: text("caption"),
  // Full task brief / page body from Notion (slide scripts, references, notes).
  content: text("content"),
  linkMateri: text("link_materi"),
  linkOutput: text("link_output"),
  linkIg: text("link_ig"),
  linkTiktok: text("link_tiktok"),
  mediaUrl: text("media_url"),
  monthlyPerformanceId: uuid("monthly_performance_id").references(
    () => monthlyPerformance.id,
    { onDelete: "set null" },
  ),
  createdBy: uuid("created_by").references(() => teamMember.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  // Indexes for the hot filters: per-client views, status boards, deadline
  // rollups, calendar-by-posting-date, sub-task lookup. Additive only.
  index("task_client_idx").on(t.clientId),
  index("task_status_idx").on(t.status),
  index("task_due_date_idx").on(t.dueDate),
  index("task_posting_date_idx").on(t.postingDate),
  index("task_parent_idx").on(t.parentId),
]);

export const taskAssignee = moteteam.table(
  "task_assignee",
  {
    taskId: uuid("task_id")
      .notNull()
      .references(() => task.id, { onDelete: "cascade" }),
    teamMemberId: uuid("team_member_id")
      .notNull()
      .references(() => teamMember.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.taskId, t.teamMemberId] }),
    // "Task Saya" + workload queries filter by member.
    index("task_assignee_member_idx").on(t.teamMemberId),
  ],
);

// Editable app config (integration tokens + enable flags). DB overrides env.
export const appSetting = moteteam.table("app_setting", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invitation = moteteam.table("invitation", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  // App access role granted on accept (admin | member).
  role: text("role").notNull().default("member"),
  token: text("token").notNull().unique(),
  invitedBy: text("invited_by").references(() => user.id, {
    onDelete: "set null",
  }),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const okr = moteteam.table("okr", {
  id: uuid("id").defaultRandom().primaryKey(),
  objective: text("objective").notNull(),
  keyResult: text("key_result"),
  target: numeric("target"),
  progress: numeric("progress"),
  period: text("period"), // e.g. "2026-04"
  clientId: uuid("client_id").references(() => client.id, {
    onDelete: "set null",
  }),
  teamMemberId: uuid("team_member_id").references(() => teamMember.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
