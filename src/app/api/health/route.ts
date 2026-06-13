// Health check for UptimeRobot + the in-process self-ping (PRD 5.1).
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok", ts: Date.now() });
}
