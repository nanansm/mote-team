/**
 * Anti-stuck instrumentation (PRD 5.1). Node.js runtime only:
 *  - global handlers so an unhandled error logs instead of silently wedging
 *  - self-ping /api/health every 45s to keep the container warm after idle
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  process.on("uncaughtException", (err) => {
    console.error("[uncaughtException]", err);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
  });

  const port = process.env.PORT ?? "3005";
  const url =
    process.env.HEALTH_PING_URL ?? `http://127.0.0.1:${port}/api/health`;

  setInterval(() => {
    fetch(url).catch(() => {
      /* swallow — ping is best-effort */
    });
  }, 45_000);
}
