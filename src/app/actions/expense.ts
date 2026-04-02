"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReimbursementStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function submitExpense(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const gatheringId = String(formData.get("gatheringId") ?? "");
  const receiptUrl = String(formData.get("receiptUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const payoutHandle = String(formData.get("payoutHandle") ?? "").trim();

  if (!receiptUrl || !description || !payoutHandle)
    throw new Error("Missing fields");

  const g = await prisma.gathering.findUniqueOrThrow({
    where: { id: gatheringId },
  });
  if (g.hostId !== session.user.id) throw new Error("Not host");
  if (g.startsAt > new Date()) throw new Error("Event has not occurred yet");

  await prisma.expenseSubmission.create({
    data: {
      gatheringId,
      hostId: session.user.id,
      receiptUrl,
      description,
      payoutHandle,
      status: ReimbursementStatus.SUBMITTED,
    },
  });

  revalidatePath("/host");
  revalidatePath(`/host/${gatheringId}`);
}
