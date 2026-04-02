"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TokenLedgerType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function purchaseTokensStub(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const pack = Number(formData.get("pack") ?? 0);
  const grant = pack === 3 ? 3 : pack === 1 ? 1 : 0;
  if (!grant) throw new Error("Invalid pack");

  // TODO: Stripe Checkout; this stub credits tokens for local testing only.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { tokensAvailable: { increment: grant } },
    }),
    prisma.tokenLedgerEntry.create({
      data: {
        userId: session.user.id,
        delta: grant,
        type: TokenLedgerType.GRANT,
        note: `Stub purchase: ${grant} token(s)`,
      },
    }),
  ]);

  revalidatePath("/profile");
  revalidatePath("/profile/tokens");
}
