import { finalizeGatheringWithRefunds } from "@/app/actions/gathering";
import { prisma } from "@/lib/prisma";
import {
  GatheringRequestStatus,
  GatheringStatus as GatheringStatusEnum,
} from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * Run every few minutes via Vercel Cron / external scheduler.
 * POST with header: Authorization: Bearer ${CRON_SECRET}
 *
 * Cancels published gatherings that are &lt;2h away if
 * hostFriends + approved guests &lt; minTotalSize.
 */
export async function POST(req: Request) {
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
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const candidates = await prisma.gathering.findMany({
    where: {
      status: GatheringStatusEnum.PUBLISHED,
      startsAt: { gt: now, lte: twoHoursFromNow },
      autoCancelCheckedAt: null,
    },
  });

  const results: { id: string; action: string }[] = [];

  for (const g of candidates) {
    const approved = await prisma.gatheringRequest.count({
      where: {
        gatheringId: g.id,
        status: GatheringRequestStatus.APPROVED,
      },
    });

    const total = g.hostFriendsCount + approved;

    if (total < g.minTotalSize) {
      await finalizeGatheringWithRefunds(g.id, GatheringStatusEnum.AUTO_CANCELLED, {
        setAutoCancelCheckedAt: true,
      });
      results.push({ id: g.id, action: "auto_cancelled" });
    } else {
      await prisma.gathering.update({
        where: { id: g.id },
        data: { autoCancelCheckedAt: new Date() },
      });
      results.push({ id: g.id, action: "passed_min_check" });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
  });
}
