import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { markAllRead } from "@/app/actions/notification";
import { NotificationsFeed } from "./notifications-feed";

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const wasUnread = new Map(items.map((n) => [n.id, !n.read]));
  if (items.some((n) => !n.read)) {
    await markAllRead();
  }

  const rows = items.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    wasUnread: wasUnread.get(n.id) ?? false,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="pb-10">
      <p className="mb-8 max-w-prose font-serif text-[15px] leading-relaxed text-lc-earth-muted sm:text-[16px]">
        In-app copies of important updates. SMS uses the welcome / STOP flow
        from your phone step.
      </p>

      <NotificationsFeed items={rows} />
    </div>
  );
}
