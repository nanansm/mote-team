import Link from "next/link";
import { cn } from "@/lib/utils";

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Render a message/comment body: `@[Name](u:id)` highlight, `#[Title](t:id)`
 * task link, plus legacy plain `@Name` highlight (text sent before structured
 * tokens existed). Shared by team chat and task comments.
 */
export function MentionText({
  body,
  names = [],
  mine = false,
  className,
}: {
  body: string;
  names?: string[];
  mine?: boolean;
  className?: string;
}) {
  const present = names
    .filter((n) => body.includes(`@${n}`))
    .sort((a, b) => b.length - a.length);
  const parts = [
    String.raw`@\[[^\]]+\]\(u:[^)]+\)`,
    String.raw`#\[[^\]]+\]\(t:[^)]+\)`,
  ];
  if (present.length) parts.push(`@(?:${present.map(escapeRe).join("|")})`);
  const re = new RegExp(parts.join("|"), "g");
  const hi = cn("font-semibold", mine ? "underline" : "text-primary");
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(body))) {
    if (m.index > last) out.push(body.slice(last, m.index));
    const s = m[0];
    if (s.startsWith("@[")) {
      out.push(
        <span key={i++} className={hi}>
          @{s.slice(2, s.indexOf("]"))}
        </span>,
      );
    } else if (s.startsWith("#[")) {
      const id = s.slice(s.indexOf("(t:") + 3, -1);
      out.push(
        <Link key={i++} href={`/tasks?task=${id}`} className={cn(hi, "underline")}>
          #{s.slice(2, s.indexOf("]"))}
        </Link>,
      );
    } else {
      out.push(
        <span key={i++} className={hi}>
          {s}
        </span>,
      );
    }
    last = m.index + s.length;
  }
  if (last < body.length) out.push(body.slice(last));
  return <span className={className}>{out.length ? out : body}</span>;
}
