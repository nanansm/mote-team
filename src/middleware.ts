import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Optimistic edge gate: redirect to /sign-in when no session cookie is present.
 * The authoritative check (DB + allowlist) happens in the protected layout.
 */
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const url = new URL("/sign-in", request.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Protect everything except sign-in, auth API, health, and static assets.
  matcher: [
    // Protect everything except auth pages, auth/health APIs, Next internals,
    // and any static file (path containing a dot, e.g. /brand/logo.png).
    "/((?!sign-in|accept-invite|reset-password|api/auth|api/health|api/cron|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
