import { asc, eq } from "drizzle-orm";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandPalette } from "@/components/command-palette";
import { TopBar } from "@/components/top-bar";
import { db } from "@/db";
import { client } from "@/db/schema";
import { requireSession } from "@/lib/session";

// Auth (cookie + DB + allowlist) makes every route here dynamic.
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const isAdmin = session.user.role === "admin";

  const clients = await db
    .select({ id: client.id, name: client.name })
    .from(client)
    .where(eq(client.status, "active"))
    .orderBy(asc(client.name));

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          isAdmin={isAdmin}
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
        />
        <main className="flex-1 overflow-auto bg-gradient-to-b from-muted/50 to-background p-4 md:p-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <CommandPalette clients={clients} isAdmin={isAdmin} />
    </div>
  );
}
