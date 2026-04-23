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

  if (unreadIds.size > 0) {
    await markAllRead();
  }

  return (
    <div className="pb-10">
      <p className="mb-8 text-sm text-neutral-600">
        In-app copies of important updates. SMS uses the welcome / STOP flow
        from your phone step.
      </p>

      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-neutral-300 bg-white/50 px-4 py-8 text-center text-sm text-neutral-500">
            You&apos;re all caught up.
          </li>
        ) : (
          items.map((n) => {
            const isUnread = unreadIds.has(n.id);
            return (
              <li
                key={n.id}
                className={`rounded-2xl border p-4 text-sm shadow-sm transition ${
                  isUnread
                    ? "border-gather-brown/25 bg-gather-cream/60 ring-1 ring-gather-accent/20"
                    : "border-neutral-200/70 bg-white ring-1 ring-black/[0.02]"
                }`}
              >
                {isUnread && (
                  <span className="mb-2 inline-flex items-center rounded-full bg-gather-brown px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gather-cream shadow-sm">
                    New
                  </span>
                )}
                <p className="font-semibold text-gather-ink">{n.title}</p>
                <p className="mt-1 leading-relaxed text-neutral-700">{n.body}</p>
                <p className="mt-2 text-xs text-neutral-400">
                  {n.createdAt.toLocaleString()}
                </p>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
