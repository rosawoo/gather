import { prisma } from "@/lib/prisma";
import {
  GatheringRequestStatus,
  GatheringStatus as GatheringStatusEnum,
} from "@prisma/client";
import { sendSmsToUser } from "@/lib/sms";
import { NextResponse } from "next/server";

/**
 * Run on a schedule via Vercel Cron (vercel.json). Uses the same
 * Authorization: Bearer ${CRON_SECRET} as /api/cron/auto-cancel.
 *
 * Sends one in-app notification + SMS per user (host + approved guests)
 * when startsAt is within the next 24 hours, idempotent via reminderNotifiedAt.
 *
 * On Vercel Hobby, crons may run at most once per day. Schedule accordingly in
 * vercel.json (a daily sweep still catches every gathering in the window).
 */
async function handler(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET not set" },
      { status: 500 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const candidates = await prisma.gathering.findMany({
    where: {
      status: GatheringStatusEnum.PUBLISHED,
      startsAt: { gt: now, lte: in24h },
      reminderNotifiedAt: null,
    },
    include: {
      requests: {
        where: { status: GatheringRequestStatus.APPROVED },
        select: { guestId: true },
      },
    },
  });

  const results: { id: string; notified: number }[] = [];

  for (const g of candidates) {
    const guestIds = g.requests.map((r) => r.guestId);
    const recipientIds = [...new Set([g.hostId, ...guestIds])];

    const timeStr = g.startsAt.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const body = `"${g.title}" starts ${timeStr}. Open the app for address and details.`;
    const smsBody = `Gather: Reminder: "${g.title}" starts ${timeStr}. Open the app for address and details.`;

    await prisma.notification.createMany({
      data: recipientIds.map((userId) => ({
        userId,
        title: "Gathering soon",
        body,
        kind: "gathering_reminder_soon",
        meta: JSON.stringify({ gatheringId: g.id }),
      })),
    });

    for (const uid of recipientIds) {
      void sendSmsToUser(uid, smsBody).catch((e) =>
        console.error("[sms:event-reminder]", g.id, uid, e),
      );
    }

    await prisma.gathering.update({
      where: { id: g.id },
      data: { reminderNotifiedAt: new Date() },
    });

    results.push({ id: g.id, notified: recipientIds.length });
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
  });
}

export const GET = handler;
export const POST = handler;
