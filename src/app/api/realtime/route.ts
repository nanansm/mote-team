import { requireSession } from "@/lib/session";
import { addClient, onlineUsers, subscribe, type RealtimeEvent } from "@/lib/realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// SSE stream: presence updates + new chat messages. One connection per browser
// tab = that user's "online" signal. Heartbeat keeps Traefik from idle-closing.
export async function GET(req: Request) {
  const session = await requireSession();
  const enc = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const send = (s: string) => {
        try {
          controller.enqueue(enc.encode(s));
        } catch {
          /* closed */
        }
      };
      const sendEvent = (e: RealtimeEvent) => send(`data: ${JSON.stringify(e)}\n\n`);

      const removeClient = addClient({
        userId: session.user.id,
        name: session.user.name,
        image: session.user.image ?? null,
      });
      // Snapshot (now includes self) then live subscription.
      sendEvent({ type: "presence", users: onlineUsers() });
      const unsub = subscribe(sendEvent);
      const hb = setInterval(() => send(`: ping\n\n`), 25_000);

      cleanup = () => {
        clearInterval(hb);
        unsub();
        removeClient();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };
      req.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
