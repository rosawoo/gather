"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleSmsOptOut() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { smsOptOut: !user.smsOptOut },
  });

  revalidatePath("/profile/settings");
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Cascade delete handles related records (profile, photos, notifications, etc.)
  await prisma.user.delete({ where: { id: session.user.id } });

  await signOut({ redirectTo: "/" });
}
