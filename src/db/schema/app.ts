import {
  type AnyPgColumn,
  boolean,
  date,
  index,
  integer,
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

// Client-facing content approval state (shared via public token link).
export const approvalStatus = moteteam.enum("approval_status", [
  "pending",
  "approved",
  "revision",
]);

// KOL outreach → activation pipeline (mirrors the team's tracking sheet).
export const kolStatus = moteteam.enum("kol_status", [
  "belum_bales_dm",
  "sudah_bales_dm",
  "minta_rate_card",
  "nego",
  "deal",
  "mau_datang_review",
  "sudah_posting",
  "sudah_review",
  "cancel",
]);

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
  // Brand accent color (hex) shown in the task list. Null → auto-derived from id.
  color: text("color"),
  // Windsor.ai account names (per platform) for pulling organic performance.
  windsorAccountId: text("windsor_account_id"), // Instagram account_name
  windsorTiktokId: text("windsor_tiktok_id"), // TikTok account_name
  windsorGmbId: text("windsor_gmb_id"), // Google My Business account_name (Maps)
  // Meta Ads account id (without act_ prefix) for paid performance via Graph API.
  metaAdAccountId: text("meta_ad_account_id"),
  // Direct-API mapping (replaces Windsor): IG Business user id (Meta Graph),
  // Repliz account _id (TikTok), GMB location resource ("locations/{id}").
  igUserId: text("ig_user_id"),
  replizAccountId: text("repliz_account_id"),
  gmbLocationId: text("gmb_location_id"),
  // TikTok absolute followers (Repliz has no total count) — manual, occasional.
  tiktokFollowers: integer("tiktok_followers"),
  // Free-form notes/links for the team (briefs, drive links, brand guides).
  notes: text("notes"),
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
  phone: text("phone"), // WhatsApp number, stored normalized (62…) — see lib/whatsapp
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
  // Client approval (token set only when shared; status/note set when client acts).
  approvalToken: text("approval_token").unique(),
  approvalStatus: approvalStatus("approval_status"),
  approvalNote: text("approval_note"),
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

// Collaboration: comment/notes thread per task (text or links).
export const taskComment = moteteam.table(
  "task_comment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => task.id, { onDelete: "cascade" }),
    authorUserId: text("author_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("task_comment_task_idx").on(t.taskId)],
);

// Team chat: one shared channel (#umum). One row = one message.
export const chatMessage = moteteam.table(
  "chat_message",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("chat_message_created_idx").on(t.createdAt)],
);

// Recurring content template: one row = one recurring task line for a client.
// "Generate bulan ini" creates tasks with postingDate = month + dayOfMonth.
export const taskTemplate = moteteam.table(
  "task_template",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => client.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    typeContent: typeContent("type_content"),
    dayOfMonth: integer("day_of_month"), // 1..31, target posting day
    caption: text("caption"),
    sort: integer("sort").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("task_template_client_idx").on(t.clientId)],
);

// KOL activation: one row = one KOL collaboration (spanning IG + TikTok),
// team-entered (no API source — mirrors their Google Sheet). Derived metrics
// (interaction, total cost, ER%, CPE, CPV) are computed in code, never stored.
export const kolActivation = moteteam.table(
  "kol_activation",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => client.id, { onDelete: "cascade" }),
    period: text("period").notNull(), // month, e.g. "2026-06"
    status: kolStatus("status").notNull().default("belum_bales_dm"),
    username: text("username").notNull(),
    // Pre-collab profile (per platform, often partial).
    igLink: text("ig_link"),
    igFollowers: integer("ig_followers"),
    igEr: numeric("ig_er"), // organic ER %
    tiktokLink: text("tiktok_link"),
    tiktokFollowers: integer("tiktok_followers"),
    tiktokEr: numeric("tiktok_er"),
    placement: text("placement"), // e.g. "Reels & Tiktok"
    linkPost: text("link_post"),
    datePost: date("date_post"),
    // Cost — kept separate, summed in code to total (= "Product & Cost").
    fee: numeric("fee").default("0").notNull(), // rate card / cash (Rp)
    productCost: numeric("product_cost").default("0").notNull(), // product value (Rp)
    // After-post results (combined IG + TikTok).
    reach: integer("reach").default(0).notNull(), // audience reach
    impressions: integer("impressions").default(0).notNull(), // content impression
    likes: integer("likes").default(0).notNull(),
    comments: integer("comments").default(0).notNull(),
    shares: integer("shares").default(0).notNull(),
    saves: integer("saves").default(0).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("kol_client_period_idx").on(t.clientId, t.period)],
);

// Client revenue + manual monthly metrics: one row per client per month,
// team-entered. Feeds the head dashboard's Real Omset + manual funnel metrics
// (page view, OTA clicks) that no API tracks. Table name kept (`offline_metric`)
// for migration safety; old foot-traffic columns left unused (additive only).
export const offlineMetric = moteteam.table(
  "offline_metric",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => client.id, { onDelete: "cascade" }),
    period: text("period").notNull(), // month, e.g. "2026-06"
    // Revenue inputs.
    targetOmset: numeric("target_omset").default("0").notNull(), // Rp
    revenue: numeric("revenue").default("0").notNull(), // Rp
    numberOfBill: integer("number_of_bill").default(0).notNull(),
    // Optional manual funnel metrics (vary per client — shown on dashboard only
    // when filled). Hotel: page view / OTA / WhatsApp clicks; F&B/online:
    // conversion + revenue online.
    pageView: integer("page_view"),
    clickOta: integer("click_ota"),
    clickWhatsapp: integer("click_whatsapp"),
    conversionOnline: integer("conversion_online"),
    revenueOnline: numeric("revenue_online"),
    notes: text("notes"),
    // --- legacy (unused, kept for additive migration) ---
    covers: integer("covers").default(0).notNull(),
    reservations: integer("reservations").default(0).notNull(),
    walkins: integer("walkins").default(0).notNull(),
    promoRedemptions: integer("promo_redemptions").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("offline_client_period_idx").on(t.clientId, t.period)],
);
