/**
 * Safe post-login path for OAuth `callbackUrl` / `redirectTo`.
 * Next.js may pass `string | string[] | undefined` for query values.
 */
export function oauthCallbackPath(
  raw: string | string[] | undefined,
  whenInvalidOrMissing: string,
): string {
  if (raw === undefined) return whenInvalidOrMissing;
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (typeof v !== "string") return whenInvalidOrMissing;
  if (!v.startsWith("/") || v.startsWith("//")) return whenInvalidOrMissing;
  if (v.includes("://") || v.includes("..")) return whenInvalidOrMissing;
  return v;
}
