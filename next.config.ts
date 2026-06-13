import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deployed via Dockerfile (Node 20) running `next start` with full
  // node_modules — no standalone output needed. Anti-stuck (PRD 5.1) is
  // handled by the pg pool + /api/health self-ping, not the build mode.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
