import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GatheringRequestStatus, GatheringStatus, Plan } from "@prisma/client";
import Link from "next/link";
import { capacityLine } from "@/lib/gathering-display";

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
    <div className="pb-28">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Host a gathering
        </h2>
        {canHost ? (
          <Link
            href="/host/new"
            className="mt-3 inline-flex rounded-full bg-gather-brown px-5 py-3 text-sm font-medium text-gather-cream"
          >
            New gathering
          </Link>
        ) : (
          <p className="mt-2 text-sm text-neutral-600">
            Your plan doesn&apos;t include hosting. Upgrade when Member is
            available.
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Current gatherings
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
              return (
                <li key={g.id}>
                  <Link
                    href={`/host/${g.id}`}
                    className="block rounded-xl border border-neutral-200 bg-white p-4 text-sm shadow-sm transition hover:border-gather-accent/50"
                  >
                    <p className="font-medium text-gather-ink">{g.title}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {g.startsAt.toLocaleString()}
                    </p>
                    <p className="mt-2 text-xs text-neutral-600">
                      {attending} / {g.maxTotalSize} attending · {pending}{" "}
                      pending
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {capacityLine(
                        g.minTotalSize,
                        g.maxTotalSize,
                        g.hostFriendsCount,
                      )}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Past gatherings / reimbursements
        </h2>
        {past.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">Nothing yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {past.map((g) => {
              const approved = g.requests.filter(
                (r) => r.status === GatheringRequestStatus.APPROVED,
              ).length;
              const budget = (approved * 7.5).toFixed(2);
              const sub = g.expenseSubmissions[0];
              let statusLabel = "Reimbursement pending";
              if (sub) {
                if (sub.status === "SUBMITTED") statusLabel = "Expense submitted";
                if (sub.status === "SENT") statusLabel = "Reimbursement sent";
              }
              return (
                <li key={g.id}>
                  <Link
                    href={`/host/${g.id}`}
                    className="block rounded-xl border border-neutral-200 bg-white p-4 text-sm"
                  >
                    <p className="font-medium">{g.title}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {g.startsAt.toLocaleDateString()} · {approved} attendees ·
                      budget ${budget}
                    </p>
                    <p className="mt-1 text-xs font-medium text-gather-brown-mid">
                      {statusLabel}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
