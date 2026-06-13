import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Anti-stuck: standalone build for Easypanel/Docker (PRD 5.1).
  output: "standalone",
  // Pin tracing to this repo so standalone output is correct despite the
  // stray lockfile in the home directory.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
