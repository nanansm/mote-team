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
