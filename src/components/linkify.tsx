import { Fragment } from "react";

const URL_RE = /(https?:\/\/[^\s]+)/g;
const IS_URL = /^https?:\/\//;
// Trailing punctuation that almost always belongs to prose, not the URL.
const TRAILING = /[.,;:!?'")\]}]+$/;

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
        // Split off trailing punctuation so e.g. "(https://x/a)." links to
        // "https://x/a" and renders ")." as plain text.
        const trail = part.match(TRAILING)?.[0] ?? "";
        const url = trail ? part.slice(0, -trail.length) : part;
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
