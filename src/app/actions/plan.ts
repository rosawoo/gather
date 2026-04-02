"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Plan, TokenLedgerType } from "@prisma/client";
import { redirect } from "next/navigation";

/** Beta: only OG is selectable. Grants 1 token for one month of access. */
export async function selectOgPlan() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        plan: Plan.OG,
        planStartedAt: new Date(),
        tokensAvailable: { increment: 1 },
      },
    });
    await tx.tokenLedgerEntry.create({
      data: {
        userId,
        delta: 1,
        type: TokenLedgerType.GRANT,
        note: "OG beta — 1 welcome token",
      },
    });
  });

  redirect("/gatherings");
}
