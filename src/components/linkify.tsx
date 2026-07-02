import { Fragment } from "react";

const URL_RE = /(https?:\/\/[^\s]+)/g;
const IS_URL = /^https?:\/\//;

/**
 * Split trailing prose punctuation off a URL. Closing brackets are kept when
 * they balance an opener inside the URL (e.g. Wikipedia "..._(TV_series)"),
 * so only genuinely dangling punctuation is trimmed. Shared by Linkify and
 * MentionText so both linkify URLs identically.
 */
export function trimUrl(raw: string): { url: string; trail: string } {
  let end = raw.length;
  const balanced = (s: string, open: string, close: string) =>
    s.split(open).length - 1 >= s.split(close).length - 1;
  while (end > 0) {
    const ch = raw[end - 1];
    if (".,;:!?'\"".includes(ch)) {
      end--;
      continue;
    }
    if (ch === ")" || ch === "]" || ch === "}") {
      const open = ch === ")" ? "(" : ch === "]" ? "[" : "{";
      if (!balanced(raw.slice(0, end), open, ch)) {
        end--;
        continue;
      }
    }
    break;
  }
  return { url: raw.slice(0, end), trail: raw.slice(end) };
}

/**
 * Render free-form text with clickable links. Plain text otherwise.
 * Used for client notes and task comments (team-entered text + links).
 */
export function Linkify({ text, className }: { text: string; className?: string }) {
  const parts = text.split(URL_RE);
  return (
    <p className={`whitespace-pre-wrap break-words ${className ?? ""}`}>
      {parts.map((part, i) => {
        if (!IS_URL.test(part)) return <Fragment key={i}>{part}</Fragment>;
        const { url, trail } = trimUrl(part);
        return (
          <Fragment key={i}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              {url}
            </a>
            {trail}
          </Fragment>
        );
      })}
    </p>
  );
}
