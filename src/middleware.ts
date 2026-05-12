import { auth } from "@/auth";

/**
 * Uses `middleware.ts` so Next attaches `mod.middleware` (Proxy Web Handler expects
 * `mod.proxy`; `export default auth(...)` satisfies the middleware loader).
 */
export default auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(signInUrl);
  }
});

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
