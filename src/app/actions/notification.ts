"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/** Mark all unread notifications as read for the current user. */
export async function markAllRead() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/profile");
  revalidatePath("/profile/notifications");
}

/** Return the number of unread notifications for the given user. */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function deleteNotification(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const deleted = await prisma.notification.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (deleted.count === 0) throw new Error("Notification not found");

  revalidatePath("/profile");
  revalidatePath("/profile/notifications");
}
