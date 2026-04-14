"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Mark all unread notifications as read for the current user. */
export async function markAllRead() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
}

/** Return the number of unread notifications for the given user. */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}
