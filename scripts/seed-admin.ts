/**
 * Bootstrap the first admin account.
 *
 *   SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... SEED_ADMIN_NAME="Nanan" \
 *     npm run seed:admin
 *
 * The email MUST also be present in ADMIN_EMAILS so the create hook grants the
 * admin role. Idempotent: skips if the user already exists.
 */
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { teamMember, user } from "../src/db/schema";
import { auth } from "../src/lib/auth";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    console.error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD.");
    process.exit(1);
  }

  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (existing) {
    console.log(`User ${email} already exists — skipping.`);
    process.exit(0);
  }

  const res = await auth.api.signUpEmail({
    body: { email, name, password },
  });
  await db
    .insert(teamMember)
    .values({ authUserId: res.user.id, name, active: true });

  console.log(`Admin created: ${res.user.email} (role from ADMIN_EMAILS).`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
