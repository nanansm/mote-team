"use client";

import { useEffect } from "react";

/** Last-resort boundary if the root layout itself throws. Must render its own
 *  <html>/<body>. Kept dependency-free so it can render in any failure state. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#faf9f7",
          color: "#1a3a2a",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 360, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Aplikasi error</h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 8 }}>
            Terjadi kesalahan tak terduga. Coba muat ulang halaman.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              padding: "8px 16px",
              borderRadius: 10,
              border: "none",
              background: "#1a3a2a",
              color: "white",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
