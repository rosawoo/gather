import { NextResponse } from "next/server";

/**
 * Next.js 16 on Vercel still wires a Proxy Web Handler; without a valid handler
 * exports, requests 500. Auth is enforced in `(main)/layout.tsx`; this is a no-op
 * pass-through for the previous matcher scope.
 */
export default function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/gatherings/:path*",
    "/host/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/u/:path*",
    "/report",
  ],
};
