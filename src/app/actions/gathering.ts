"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  type GatheringStatus,
  GatheringStatus as GatheringStatusEnum,
  GatheringType,
  Plan,
  TokenLedgerType,
} from "@prisma/client";
import { sendSmsToUser } from "@/lib/sms";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function canHost(plan: Plan) {
  return plan === Plan.OG || plan === Plan.MEMBER;
}

export async function createGathering(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });
  if (!canHost(user.plan)) throw new Error("Your plan cannot host events");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const neighborhood = String(formData.get("neighborhood") ?? "").trim();
  const addressSecret = String(formData.get("addressSecret") ?? "").trim();
  const gatheringType = String(
    formData.get("gatheringType") ?? "HOME",
  ) as GatheringType;
  const startsAt = new Date(String(formData.get("startsAt") ?? ""));
  const applicantQuestion =
    String(formData.get("applicantQuestion") ?? "").trim() || null;
  const tokenCost = Number(formData.get("tokenCost") ?? 0);
  const budgetExplanation =
    String(formData.get("budgetExplanation") ?? "").trim() || null;
  const minTotalSize = Number(formData.get("minTotalSize") ?? 0);
  const maxTotalSize = Number(formData.get("maxTotalSize") ?? 0);
  const hostFriendsCount = Number(formData.get("hostFriendsCount") ?? 0);
  const coverImageUrl =
    String(formData.get("coverImageUrl") ?? "").trim() || null;

  if (!title || !description || !neighborhood || !addressSecret)
    throw new Error("Missing required fields");
  if (Number.isNaN(startsAt.getTime())) throw new Error("Invalid date");
  if (minTotalSize < 1 || maxTotalSize < minTotalSize)
    throw new Error("Invalid capacity");
  if (hostFriendsCount < 0 || hostFriendsCount > maxTotalSize)
    throw new Error("Invalid friends count");

  await prisma.gathering.create({
    data: {
      hostId: user.id,
      title,
      description,
      gatheringType,
      neighborhood,
      addressSecret,
      startsAt,
      applicantQuestion,
      tokenCost,
      budgetExplanation,
      minTotalSize,
      maxTotalSize,
      hostFriendsCount,
      coverImageUrl,
      status: GatheringStatusEnum.PUBLISHED,
    },
  });

  revalidatePath("/gatherings");
  revalidatePath("/host");
  redirect("/host");
}

/**
 * Refunds guests and closes a gathering. Used by host cancel and auto-cancel cron.
 */
export async function finalizeGatheringWithRefunds(
  gatheringId: string,
  finalStatus: Extract<GatheringStatus, "CANCELLED" | "AUTO_CANCELLED">,
  options?: { setAutoCancelCheckedAt?: boolean },
) {
  const g = await prisma.gathering.findUniqueOrThrow({
    where: { id: gatheringId },
    include: { requests: true },
  });

  await prisma.$transaction(async (tx) => {
    for (const r of g.requests) {
      if (r.status === "PENDING" || r.status === "APPROVED") {
        if (r.tokensAmount > 0) {
          if (r.status === "PENDING") {
            await tx.user.update({
              where: { id: r.guestId },
              data: {
                tokensAvailable: { increment: r.tokensAmount },
                tokensHeld: { decrement: r.tokensAmount },
              },
            });
            await tx.tokenLedgerEntry.create({
              data: {
                userId: r.guestId,
                delta: r.tokensAmount,
                type: TokenLedgerType.RELEASE,
                gatheringId,
                requestId: r.id,
                note:
                  finalStatus === GatheringStatusEnum.AUTO_CANCELLED
                    ? "Auto-cancelled — minimum not met — held tokens returned"
                    : "Host cancelled — held tokens returned",
              },
            });
          } else {
            await tx.user.update({
              where: { id: r.guestId },
              data: { tokensAvailable: { increment: r.tokensAmount } },
            });
            await tx.tokenLedgerEntry.create({
              data: {
                userId: r.guestId,
                delta: r.tokensAmount,
                type: TokenLedgerType.REFUND,
                gatheringId,
                requestId: r.id,
                note:
                  finalStatus === GatheringStatusEnum.AUTO_CANCELLED
                    ? "Auto-cancelled — minimum not met — tokens refunded"
                    : "Host cancelled — used tokens refunded",
              },
            });
          }
        }
        await tx.gatheringRequest.update({
          where: { id: r.id },
          data: { status: "WITHDRAWN" },
        });
      }
    }
    await tx.gathering.update({
      where: { id: gatheringId },
      data: {
        status: finalStatus,
        cancelledAt: new Date(),
        ...(options?.setAutoCancelCheckedAt
          ? { autoCancelCheckedAt: new Date() }
          : {}),
      },
    });
  });

  const title = g.title;
  const guestIds = g.requests
    .filter((r) => r.status === "PENDING" || r.status === "APPROVED")
    .map((r) => r.guestId);

  const reason =
    finalStatus === GatheringStatusEnum.AUTO_CANCELLED
      ? "was cancelled — the minimum group size wasn’t met in time."
      : "was cancelled by the host.";

  await prisma.notification.createMany({
    data: [
      {
        userId: g.hostId,
        title: "Gathering cancelled",
        body: `“${title}” ${reason}`,
        kind:
          finalStatus === GatheringStatusEnum.AUTO_CANCELLED
            ? "gathering_auto_cancelled_host"
            : "gathering_cancelled_host",
        meta: JSON.stringify({ gatheringId }),
      },
      ...guestIds.map((guestId) => ({
        userId: guestId,
        title: "Gathering cancelled",
        body: `“${title}” ${reason} Any held tokens were returned.`,
        kind:
          finalStatus === GatheringStatusEnum.AUTO_CANCELLED
            ? "gathering_auto_cancelled_guest"
            : "gathering_cancelled_guest",
        meta: JSON.stringify({ gatheringId }),
      })),
    ],
  });

  const smsNote =
    finalStatus === GatheringStatusEnum.AUTO_CANCELLED
      ? "cancelled — minimum group size wasn’t met in time."
      : "cancelled by the host.";
  void sendSmsToUser(
    g.hostId,
    `Gather: “${title}” ${smsNote}`,
  ).catch(() => {});
  for (const guestId of guestIds) {
    void sendSmsToUser(
      guestId,
      `Gather: “${title}” ${smsNote} Tokens were returned where applicable.`,
    ).catch(() => {});
  }

  revalidatePath("/gatherings");
  revalidatePath("/host");
}

export async function cancelGatheringAsHost(gatheringId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const g = await prisma.gathering.findUniqueOrThrow({
    where: { id: gatheringId },
  });
  if (g.hostId !== session.user.id) throw new Error("Not host");

  await finalizeGatheringWithRefunds(gatheringId, GatheringStatusEnum.CANCELLED);
}

export async function cancelGatheringAsHostAction(formData: FormData) {
  const gatheringId = String(formData.get("gatheringId") ?? "");
  await cancelGatheringAsHost(gatheringId);
}
