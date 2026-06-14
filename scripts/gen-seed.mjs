/**
 * LOCAL-ONLY generator (not run in prod). Reads the local dev DB and emits
 * scripts/seed-prod.sql — data-only INSERTs (ON CONFLICT DO NOTHING) for
 * client + team_member + task + task_assignee, EXCLUDING the GWESHA client
 * (contract ended). Nulls fragile FKs (auth_user_id, created_by,
 * monthly_performance_id) so the seed is self-contained.
 *
 * Run: node scripts/gen-seed.mjs   (needs LOCAL_DATABASE_URL or default :5433)
 */
import fs from "node:fs";
import postgres from "postgres";

const url =
  process.env.LOCAL_DATABASE_URL ||
  "postgresql://mote:mote@127.0.0.1:5433/mote-db";
const sql = postgres(url, { max: 1 });

const q = (v) => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  if (v instanceof Date) return `'${v.toISOString()}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

function insertBlock(table, cols, rows, { conflict }) {
  if (!rows.length) return "";
  const colList = cols.map((c) => `"${c}"`).join(", ");
  const values = rows
    .map((r) => `  (${cols.map((c) => q(r[c])).join(", ")})`)
    .join(",\n");
  return `INSERT INTO moteteam."${table}" (${colList}) VALUES\n${values}\nON CONFLICT ${conflict} DO NOTHING;\n\n`;
}

const [gwesha] = await sql`select id from moteteam.client where name = 'GWESHA'`;
const gwId = gwesha?.id ?? "00000000-0000-0000-0000-000000000000";

const clients = await sql`
  select id,name,status,contract_end,logo_url,created_at,updated_at,
         windsor_account_id,windsor_tiktok_id,meta_ad_account_id
  from moteteam.client where id <> ${gwId} order by name`;

const members = await sql`
  select id, null::uuid as auth_user_id, name, role, division, active, grade,
         created_at, updated_at, code, reports_to, email
  from moteteam.team_member order by code`;

const tasks = await sql`
  select id,title,status,client_id,parent_id,due_date,posting_date,type_content,
         caption,link_materi,link_output,link_ig,link_tiktok,media_url,
         null::uuid as monthly_performance_id, null::uuid as created_by,
         created_at,updated_at
  from moteteam.task where client_id <> ${gwId} order by created_at`;

const assignees = await sql`
  select ta.task_id, ta.team_member_id
  from moteteam.task_assignee ta
  join moteteam.task t on t.id = ta.task_id
  where t.client_id <> ${gwId}`;

let out = "-- Auto-generated prod seed (GWESHA excluded). Idempotent.\n\n";
out += insertBlock(
  "client",
  ["id","name","status","contract_end","logo_url","created_at","updated_at","windsor_account_id","windsor_tiktok_id","meta_ad_account_id"],
  clients,
  { conflict: "(id)" },
);
out += insertBlock(
  "team_member",
  ["id","auth_user_id","name","role","division","active","grade","created_at","updated_at","code","reports_to","email"],
  members,
  { conflict: "(id)" },
);
out += insertBlock(
  "task",
  ["id","title","status","client_id","parent_id","due_date","posting_date","type_content","caption","link_materi","link_output","link_ig","link_tiktok","media_url","monthly_performance_id","created_by","created_at","updated_at"],
  tasks,
  { conflict: "(id)" },
);
out += insertBlock("task_assignee", ["task_id","team_member_id"], assignees, {
  conflict: "(task_id, team_member_id)",
});

fs.writeFileSync("scripts/seed-prod.sql", out);
console.log(
  `seed-prod.sql: clients=${clients.length} members=${members.length} tasks=${tasks.length} assignees=${assignees.length} (${out.length} bytes)`,
);
await sql.end();
