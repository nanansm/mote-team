import { cn } from "@/lib/utils";

/** Instagram glyph (rounded square + lens). */
export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={cn("size-4", className)}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** TikTok glyph (note). */
export function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4", className)}
      aria-hidden
    >
      <path d="M16.5 3c.36 2.1 1.62 3.57 3.7 3.86v2.55c-1.34.06-2.55-.34-3.7-1.06v5.93c0 3.27-2.62 5.92-5.85 5.92S4.8 17.55 4.8 14.28c0-3.06 2.32-5.6 5.34-5.88v2.66c-1.5.25-2.66 1.55-2.66 3.12 0 1.74 1.4 3.16 3.13 3.16s3.13-1.42 3.13-3.16V3h2.76z" />
    </svg>
  );
}

/** Meta infinity mark — for Meta Ads (Facebook + Instagram Ads). */
export function MetaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4", className)}
      aria-hidden
    >
      <path d="M7.2 6C4.3 6 2 9 2 12.4c0 2.7 1.5 4.6 3.8 4.6 1.8 0 3-1 4.7-3.7l1.1-1.8c.2.3.5.8.9 1.4C13.9 15.4 15.4 17 17.6 17c2.6 0 4.4-2.1 4.4-5 0-3.6-2.2-6-5-6-1.7 0-3 1-4.4 3-.9-1.3-2.4-3-5.4-3Zm.3 2.3c1.5 0 2.5 1 3.6 2.7l1 1.6-1.2 2C9.8 14.4 9 15 7.9 15c-1.2 0-2-1-2-2.7 0-2.5 1.3-4 3.6-4Zm9 0c1.5 0 2.5 1.6 2.5 3.7 0 1.6-.8 2.7-2 2.7-1 0-1.8-.7-2.9-2.5l-1-1.6 1-1.6c.9-.5 1.6-.7 2.4-.7Z" />
    </svg>
  );
}
