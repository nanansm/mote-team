import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { account, invitation, session, user, verification } from "@/db/schema";
import { isAdminEmail } from "./admin";
import { env } from "./env";
import { resetPasswordEmail, sendMail } from "./mailer";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "http://localhost:3005",
    "http://127.0.0.1:3005",
    env.BETTER_AUTH_URL,
    ...env.EXTRA_ORIGINS.split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  ].filter(Boolean),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Reset password — Mote Team",
        html: resetPasswordEmail({ url }),
      });
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "member",
        input: false, // role is server-controlled, never from the client
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Invite-only sign-up: allow bootstrap admins, otherwise require a
        // valid, unexpired, unaccepted invitation. Also sets the access role.
        before: async (newUser) => {
          const email = newUser.email.toLowerCase();
          if (isAdminEmail(email)) {
            return { data: { ...newUser, role: "admin" } };
          }
          const [inv] = await db
            .select()
            .from(invitation)
            .where(
              and(
                eq(invitation.email, email),
                isNull(invitation.acceptedAt),
                gt(invitation.expiresAt, new Date()),
              ),
            )
            .limit(1);
          if (!inv) {
            throw new APIError("FORBIDDEN", {
              message: "Butuh undangan untuk mendaftar. Hubungi admin.",
            });
          }
          return { data: { ...newUser, role: inv.role } };
        },
      },
    },
  },
  // Keep nextCookies last so set-cookie propagates from server actions.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
