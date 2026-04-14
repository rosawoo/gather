import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GatheringRequestStatus, GatheringStatus, Plan } from "@prisma/client";
import Link from "next/link";

export default async function HostHubPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const canHost = user.plan === Plan.OG || user.plan === Plan.MEMBER;

  const now = new Date();

  const all = await prisma.gathering.findMany({
    where: { hostId: userId },
    orderBy: { startsAt: "desc" },
    include: {
      requests: true,
      expenseSubmissions: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  const upcoming = all.filter(
    (g) =>
      g.startsAt > now &&
      (g.status === GatheringStatus.PUBLISHED ||
        g.status === GatheringStatus.DRAFT),
  );
  const past = all.filter(
    (g) =>
      g.startsAt <= now &&
      g.status !== GatheringStatus.CANCELLED &&
      g.status !== GatheringStatus.AUTO_CANCELLED,
  );

  return (
    <div className="pb-10">
      <section>
        {canHost ? (
          <Link
            href="/host/new"
            className="inline-flex rounded-full bg-gather-brown px-5 py-3 text-sm font-medium text-gather-cream"
          >
            + New gathering
          </Link>
        ) : (
          <p className="text-sm text-neutral-600">
            Your plan doesn&apos;t include hosting. Upgrade when Member is
            available.
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">None scheduled.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {upcoming.map((g) => {
              const approved = g.requests.filter(
                (r) => r.status === GatheringRequestStatus.APPROVED,
              ).length;
              const pending = g.requests.filter(
                (r) => r.status === GatheringRequestStatus.PENDING,
              ).length;
              const attending = g.hostFriendsCount + approved;
              const dateStr = g.startsAt.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              return (
                <li key={g.id}>
                  <Link
                    href={`/host/${g.id}`}
                    className="block rounded-xl border border-neutral-200 bg-white p-4 text-sm shadow-sm transition hover:border-gather-accent/50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gather-ink">{g.title}</p>
                      {pending > 0 && (
                        <span className="rounded-full bg-gather-brown px-2 py-0.5 text-[11px] font-semibold text-gather-cream">
                          {pending} new
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">{dateStr}</p>
                    <p className="mt-2 text-xs text-neutral-600">
                      {attending}/{g.maxTotalSize} attending
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Past
          </h2>
          <ul className="mt-3 space-y-3">
            {past.map((g) => {
              const approved = g.requests.filter(
                (r) => r.status === GatheringRequestStatus.APPROVED,
              ).length;
              const budget = (approved * 7.5).toFixed(2);
              const sub = g.expenseSubmissions[0];
              let reimburseLabel = "Submit expense";
              if (sub) {
                if (sub.status === "SUBMITTED") reimburseLabel = "Submitted";
                if (sub.status === "SENT") reimburseLabel = "Paid";
              }
              return (
                <li key={g.id}>
                  <Link
                    href={`/host/${g.id}`}
                    className="block rounded-xl border border-neutral-200 bg-white p-4 text-sm"
                  >
                    <p className="font-medium">{g.title}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {g.startsAt.toLocaleDateString()} · {approved} attended ·
                      ${budget}
                    </p>
                    <p className="mt-1 text-xs font-medium text-gather-brown-mid">
                      {reimburseLabel}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
