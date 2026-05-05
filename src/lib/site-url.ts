/**
 * Base URL for Stripe Checkout redirects. Prefer AUTH_URL (same as Auth.js).
 * On Vercel, VERCEL_URL is set when AUTH_URL is omitted.
 */
export function getSiteUrl(): string {
  const authUrl = process.env.AUTH_URL?.trim();
  if (authUrl) return authUrl.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  throw new Error(
    "Set AUTH_URL (e.g. http://localhost:3001) for Stripe redirect URLs.",
  );
}
