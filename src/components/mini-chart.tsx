"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type ChartPoint = { date: string; value: number };

/**
 * Dependency-free interactive area chart. Pure SVG + a hover overlay that shows
 * the nearest point's value/date. Lightweight (no chart lib) per the
 * never-slow / never-stuck requirement.
 */
export function MiniChart({
  data,
  className,
  format = (n) => n.toLocaleString("id-ID"),
  height = 96,
}: {
  data: ChartPoint[];
  className?: string;
  format?: (n: number) => string;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = height;
  const pad = 6;

  if (data.length === 0) {
    return (
      <div className="grid h-24 place-items-center text-xs text-muted-foreground">
        Tidak ada data.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const n = data.length;
  const x = (i: number) => (n === 1 ? W / 2 : (i / (n - 1)) * (W - pad * 2) + pad);
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2);

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.value)}`).join(" ");
  const areaPath = `${linePath} L${x(n - 1)},${H} L${x(0)},${H} Z`;

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(x(i) - px);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    setHover(best);
  }

  const hv = hover != null ? data[hover] : null;

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="miniFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#miniFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
        {hover != null && (
          <line
            x1={x(hover)}
            y1={pad}
            x2={x(hover)}
            y2={H}
            stroke="var(--primary)"
            strokeWidth={1}
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {hover != null && (
          <circle cx={x(hover)} cy={y(data[hover].value)} r={3.5} fill="var(--primary)" />
        )}
      </svg>
      {hv && (
        <div className="pointer-events-none absolute left-2 top-1 rounded-md border bg-popover px-2 py-1 text-xs shadow-sm">
          <span className="font-semibold tabular-nums">{format(hv.value)}</span>
          <span className="ml-1.5 text-muted-foreground">{hv.date.slice(5)}</span>
        </div>
      )}
    </div>
  );
}
