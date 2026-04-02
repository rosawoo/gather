import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/", req.nextUrl.origin);
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
