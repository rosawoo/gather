import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { markAllRead } from "@/app/actions/notification";

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadIds = new Set(items.filter((n) => !n.read).map((n) => n.id));

  // Mark everything as read now that the user is viewing
  if (unreadIds.size > 0) {
    await markAllRead();
  }

  return (
    <div className="pb-28">
      <p className="text-sm text-neutral-600">
        In-app copies of important updates. SMS uses the welcome / STOP flow
        from your phone step.
      </p>
      <ul className="mt-6 space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-neutral-500">You&apos;re all caught up.</li>
        ) : (
          items.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border p-3 text-sm ${
                unreadIds.has(n.id)
                  ? "border-gather-brown/30 bg-gather-cream"
                  : "border-neutral-200 bg-white"
              }`}
            >
              {unreadIds.has(n.id) && (
                <span className="mb-1 inline-block rounded-full bg-gather-brown px-2 py-0.5 text-[10px] font-semibold text-gather-cream">
                  New
                </span>
              )}
              <p className="font-medium">{n.title}</p>
              <p className="mt-1 text-neutral-600">{n.body}</p>
              <p className="mt-2 text-xs text-neutral-400">
                {n.createdAt.toLocaleString()}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
