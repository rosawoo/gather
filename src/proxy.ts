import { auth } from "@/auth";
import type { NextFetchEvent, NextRequest } from "next/server";

const guarded = auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(signInUrl);
  }
});

/** Function declaration export required by Next.js 16 Proxy Web Handler loader. */
export async function proxy(request: NextRequest, event?: NextFetchEvent) {
  return guarded(request, event);
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
