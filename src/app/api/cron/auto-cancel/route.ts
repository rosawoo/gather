import { NextResponse } from "next/server";

/**
 * Placeholder for the “2 hours before start, below minimum capacity” job.
 * Wire to Vercel Cron or similar; verify `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function POST() {
  return NextResponse.json({ ok: true, message: "Not implemented" });
}
