import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "default" | "brand" | "green" | "amber" | "red";

const TONES: Record<Tone, string> = {
  default: "from-zinc-400 to-zinc-500",
  brand: "from-emerald-500 to-teal-600",
  green: "from-green-500 to-emerald-600",
  amber: "from-amber-400 to-orange-500",
  red: "from-rose-500 to-red-600",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
}) {
  return (
    <div className="hover-lift rounded-2xl border bg-card p-4 shadow-card hover:shadow-pop">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm",
            TONES[tone],
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
