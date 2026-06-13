import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** Session presence check for protected server components. */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }
  return session;
}

/** Admin-only gate. Members are redirected to the dashboard. */
export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}

export async function getOptionalSession() {
  return auth.api.getSession({ headers: await headers() });
}
