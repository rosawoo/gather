"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  GatheringStatus,
  GatheringType,
  Plan,
  TokenLedgerType,
} from "@prisma/client";
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
      status: GatheringStatus.PUBLISHED,
    },
  });

  revalidatePath("/gatherings");
  revalidatePath("/host");
  redirect("/host");
}

export async function cancelGatheringAsHost(gatheringId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const g = await prisma.gathering.findUniqueOrThrow({
    where: { id: gatheringId },
    include: { requests: true },
  });
  if (g.hostId !== session.user.id) throw new Error("Not host");

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
                note: "Host cancelled — held tokens returned",
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
                note: "Host cancelled — used tokens refunded",
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
      data: { status: GatheringStatus.CANCELLED, cancelledAt: new Date() },
    });
  });

  revalidatePath("/gatherings");
  revalidatePath("/host");
}

export async function cancelGatheringAsHostAction(formData: FormData) {
  const gatheringId = String(formData.get("gatheringId") ?? "");
  await cancelGatheringAsHost(gatheringId);
}
