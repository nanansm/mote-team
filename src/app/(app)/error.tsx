"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary for the protected app. Catches any thrown server
 * component / data-fetch error so a single failing query (DB down, Windsor
 * timeout) shows a recoverable card instead of a blank screen.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex max-w-md flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-card">
        <div className="grid size-12 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-400">
          <AlertTriangle className="size-6" />
        </div>
        <h2 className="mt-4 text-base font-semibold">Ada yang error</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Halaman gagal dimuat. Coba muat ulang — kalau masih error, kabari
          admin.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            ref: {error.digest}
          </p>
        )}
        <Button onClick={reset} className="mt-5">
          <RotateCw className="size-4" />
          Coba lagi
        </Button>
      </div>
    </div>
  );
}
