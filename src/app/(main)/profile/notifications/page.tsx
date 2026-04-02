import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function NotificationsPage() {
  const session = await auth();
  const items = await prisma.notification.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="px-4 pb-28">
      <Link href="/profile" className="text-sm text-gather-brown hover:underline">
        ← Profile
      </Link>
      <h1 className="mt-4 text-xl font-semibold">Notifications</h1>
      <p className="mt-2 text-sm text-neutral-600">
        In-app copies of important updates. SMS uses the welcome / STOP flow
        from your phone step (Twilio next).
      </p>
      <ul className="mt-6 space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-neutral-500">You&apos;re all caught up.</li>
        ) : (
          items.map((n) => (
            <li
              key={n.id}
              className="rounded-xl border border-neutral-200 bg-white p-3 text-sm"
            >
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
