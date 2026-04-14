"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  GatheringRequestStatus,
  GatheringStatus,
  Plan,
  TokenLedgerType,
} from "@prisma/client";
import { sendSmsToUser } from "@/lib/sms";
import { revalidatePath } from "next/cache";

function canSeeTokenCost(plan: Plan, tokenCost: number) {
  if (plan === Plan.OBSERVER && tokenCost >= 2) return false;
  return true;
}

async function countGuestSlots(gatheringId: string) {
  const g = await prisma.gathering.findUniqueOrThrow({
    where: { id: gatheringId },
    include: {
      requests: {
        where: {
          status: {
            in: [GatheringRequestStatus.PENDING, GatheringRequestStatus.APPROVED],
          },
        },
      },
    },
  });
  const guestCount = g.requests.length;
  const total = g.hostFriendsCount + guestCount;
  return { g, guestCount, total };
}

export async function requestToJoin(gatheringId: string, comment: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const { g, total } = await countGuestSlots(gatheringId);

  if (g.hostId === userId) throw new Error("Cannot join your own event");
  if (g.status !== GatheringStatus.PUBLISHED) throw new Error("Not available");
  if (!canSeeTokenCost(user.plan, g.tokenCost))
    throw new Error("Your plan cannot access this gathering");
  if (g.startsAt < new Date()) throw new Error("Event has started or passed");

  const existing = await prisma.gatheringRequest.findUnique({
    where: {
      gatheringId_guestId: { gatheringId, guestId: userId },
    },
  });
  if (existing) throw new Error("You already requested this gathering");

  if (total >= g.maxTotalSize) throw new Error("Gathering is full");

  const cost = g.tokenCost;
  if (user.tokensAvailable < cost) throw new Error("Not enough tokens");

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        tokensAvailable: { decrement: cost },
        tokensHeld: { increment: cost },
      },
    });
    await tx.tokenLedgerEntry.create({
      data: {
        userId,
        delta: -cost,
        type: TokenLedgerType.HOLD,
        gatheringId,
        note: "Request pending — tokens held",
      },
    });
    await tx.gatheringRequest.create({
      data: {
        gatheringId,
        guestId: userId,
        status: GatheringRequestStatus.PENDING,
        comment: comment.trim() || null,
        tokensAmount: cost,
      },
    });
    await tx.notification.create({
      data: {
        userId: g.hostId,
        title: "New join request",
        body: `Someone requested to join "${g.title}".`,
        kind: "host_new_request",
        meta: JSON.stringify({ gatheringId }),
      },
    });
  });

  void sendSmsToUser(
    g.hostId,
    `Gather: New request to join "${g.title}". Open the app to approve or decline.`,
  ).catch((e) => console.error("[sms:new-request]", e));

  revalidatePath("/gatherings");
  revalidatePath(`/gatherings/${gatheringId}`);
}

export async function approveRequestAction(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  await approveRequest(requestId);
}

export async function approveRequest(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const req = await prisma.gatheringRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: { gathering: true },
  });
  if (req.gathering.hostId !== session.user.id) throw new Error("Not host");

  const { total } = await countGuestSlots(req.gatheringId);
  if (total >= req.gathering.maxTotalSize) throw new Error("At capacity");

  const cost = req.tokensAmount;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: req.guestId },
      data: { tokensHeld: { decrement: cost } },
    });
    await tx.tokenLedgerEntry.create({
      data: {
        userId: req.guestId,
        delta: 0,
        type: TokenLedgerType.USE,
        gatheringId: req.gatheringId,
        requestId: req.id,
        note: `Approved — ${cost} token(s) applied to event budget`,
      },
    });
    await tx.gatheringRequest.update({
      where: { id: requestId },
      data: { status: GatheringRequestStatus.APPROVED },
    });
    await tx.notification.create({
      data: {
        userId: req.guestId,
        title: "You're in!",
        body: `Your request for "${req.gathering.title}" was approved.`,
        kind: "guest_approved",
        meta: JSON.stringify({ gatheringId: req.gatheringId }),
      },
    });
  });

  void sendSmsToUser(
    req.guestId,
    `Gather: You're in! "${req.gathering.title}" — check the app for address and details.`,
  ).catch((e) => console.error("[sms:approved]", e));

  revalidatePath("/host");
  revalidatePath(`/host/${req.gatheringId}`);
}

export async function denyRequestAction(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  await denyRequest(requestId);
}

export async function denyRequest(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const req = await prisma.gatheringRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: { gathering: true },
  });
  if (req.gathering.hostId !== session.user.id) throw new Error("Not host");

  const cost = req.tokensAmount;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: req.guestId },
      data: {
        tokensAvailable: { increment: cost },
        tokensHeld: { decrement: cost },
      },
    });
    await tx.tokenLedgerEntry.create({
      data: {
        userId: req.guestId,
        delta: cost,
        type: TokenLedgerType.RELEASE,
        gatheringId: req.gatheringId,
        requestId: req.id,
        note: "Not selected — tokens returned",
      },
    });
    await tx.gatheringRequest.update({
      where: { id: requestId },
      data: { status: GatheringRequestStatus.NOT_SELECTED },
    });
    await tx.notification.create({
      data: {
        userId: req.guestId,
        title: "Update on your request",
        body: `The host chose other guests for "${req.gathering.title}".`,
        kind: "guest_not_selected",
        meta: JSON.stringify({ gatheringId: req.gatheringId }),
      },
    });
  });

  void sendSmsToUser(
    req.guestId,
    `Gather: Update on "${req.gathering.title}" — the host chose other guests. Held tokens were returned.`,
  ).catch((e) => console.error("[sms:not-selected]", e));

  revalidatePath("/host");
  revalidatePath(`/host/${req.gatheringId}`);
}

export async function cancelGuestRequestAction(formData: FormData) {
  const gatheringId = String(formData.get("gatheringId") ?? "");
  await guestCancelRequest(gatheringId);
}

export async function guestCancelRequest(gatheringId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const req = await prisma.gatheringRequest.findUniqueOrThrow({
    where: {
      gatheringId_guestId: { gatheringId, guestId: userId },
    },
    include: { gathering: true },
  });

  const cost = req.tokensAmount;
  const g = req.gathering;

  if (req.status === GatheringRequestStatus.PENDING) {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          tokensAvailable: { increment: cost },
          tokensHeld: { decrement: cost },
        },
      });
      await tx.tokenLedgerEntry.create({
        data: {
          userId,
          delta: cost,
          type: TokenLedgerType.RELEASE,
          gatheringId,
          requestId: req.id,
          note: "Guest cancelled pending request",
        },
      });
      await tx.gatheringRequest.update({
        where: { id: req.id },
        data: { status: GatheringRequestStatus.WITHDRAWN },
      });
      await tx.notification.create({
        data: {
          userId: g.hostId,
          title: "Request withdrawn",
          body: `A guest withdrew their request for "${g.title}".`,
          kind: "host_guest_withdrew",
          meta: JSON.stringify({ gatheringId }),
        },
      });
    });
    void sendSmsToUser(
      g.hostId,
      `Gather: A guest withdrew their pending request for "${g.title}".`,
    ).catch((e) => console.error("[sms:withdraw-pending]", e));
    revalidatePath("/gatherings/upcoming");
    return;
  }

  if (req.status === GatheringRequestStatus.APPROVED) {
    const ms = g.startsAt.getTime() - Date.now();
    const hours = ms / (1000 * 60 * 60);
    if (hours < 24) throw new Error("Cannot cancel within 24 hours of the event");

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { tokensAvailable: { increment: cost } },
      });
      await tx.tokenLedgerEntry.create({
        data: {
          userId,
          delta: cost,
          type: TokenLedgerType.REFUND,
          gatheringId,
          requestId: req.id,
          note: "Guest withdrew >24h — tokens returned",
        },
      });
      await tx.gatheringRequest.update({
        where: { id: req.id },
        data: { status: GatheringRequestStatus.WITHDRAWN },
      });
      await tx.notification.create({
        data: {
          userId: g.hostId,
          title: "Approved guest dropped out",
          body: `An approved guest withdrew from "${g.title}".`,
          kind: "host_guest_withdrew",
          meta: JSON.stringify({ gatheringId }),
        },
      });
    });
    void sendSmsToUser(
      g.hostId,
      `Gather: An approved guest withdrew from "${g.title}". You may want to approve another request.`,
    ).catch((e) => console.error("[sms:withdraw-approved]", e));
    revalidatePath("/gatherings/upcoming");
    return;
  }

  throw new Error("Nothing to cancel");
}
