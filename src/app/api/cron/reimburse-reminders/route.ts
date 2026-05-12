import { prisma } from "@/lib/prisma";
import {
  GatheringRequestStatus,
  GatheringStatus as GatheringStatusEnum,
  ReimbursementStatus,
} from "@prisma/client";
import { sendSmsToUser } from "@/lib/sms";
import { NextResponse } from "next/server";

const REMINDER_KIND = "host_reimbursement_reminder";

/**
 * Daily sweep: nudge hosts to submit shared-cost receipts after a gathering
 * has ended (in-app notification + SMS when configured). Idempotent per
 * gathering via Notification row.
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
  const graceMs = 2 * 60 * 60 * 1000;
  const endedBefore = new Date(now.getTime() - graceMs);

  const candidates = await prisma.gathering.findMany({
    where: {
      status: GatheringStatusEnum.PUBLISHED,
      startsAt: { lt: endedBefore },
    },
    include: {
      requests: {
        where: { status: GatheringRequestStatus.APPROVED },
        select: { id: true },
      },
      expenseSubmissions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const results: { id: string; action: string }[] = [];

  for (const g of candidates) {
    if (g.requests.length === 0) {
      results.push({ id: g.id, action: "skip_no_guests" });
      continue;
    }

    const sub = g.expenseSubmissions[0];
    if (
      sub &&
      (sub.status === ReimbursementStatus.SUBMITTED ||
        sub.status === ReimbursementStatus.SENT)
    ) {
      results.push({ id: g.id, action: "skip_already_submitted" });
      continue;
    }

    const exists = await prisma.notification.findFirst({
      where: {
        userId: g.hostId,
        kind: REMINDER_KIND,
        meta: { contains: g.id },
      },
    });
    if (exists) {
      results.push({ id: g.id, action: "skip_already_notified" });
      continue;
    }

    const title = "Submit gathering reimbursement";
    const body = `Your gathering “${g.title}” has wrapped — add receipts and payout details from the Host tab when you’re ready.`;

    await prisma.notification.create({
      data: {
        userId: g.hostId,
        title,
        body,
        kind: REMINDER_KIND,
        meta: JSON.stringify({ gatheringId: g.id }),
      },
    });

    void sendSmsToUser(
      g.hostId,
      `Gather: "${g.title}" — time to submit shared-cost receipts in the app when you're ready.`,
    ).catch((e) => console.error("[sms:reimburse-reminder]", g.id, e));

    results.push({ id: g.id, action: "notified" });
  }

  return NextResponse.json({
    ok: true,
    processed: results.filter((r) => r.action === "notified").length,
    results,
  });
}

export const GET = handler;
export const POST = handler;
