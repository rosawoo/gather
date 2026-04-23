import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GatheringRequestStatus, GatheringStatus, Plan } from "@prisma/client";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/page-header";

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
    <div className="pb-8">
      <p className="mb-8 text-sm text-neutral-600">
        Plan small, warm gatherings for your neighbors.
      </p>

      <section className="mb-10">
        <SectionTitle title="Host a gathering" />
        {canHost ? (
          <Link
            href="/host/new"
            className="group flex items-center justify-between gap-3 rounded-2xl border border-gather-accent/40 bg-white p-4 shadow-sm ring-1 ring-gather-accent/10 transition hover:border-gather-accent hover:shadow-md"
          >
            <div>
              <p className="text-sm font-semibold text-gather-ink">
                Start a new gathering
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Pick a template or upload your own cover — takes a minute.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-gather-brown px-4 py-2 text-[13px] font-semibold text-gather-cream shadow-sm transition group-hover:bg-gather-brown-mid">
              + New
            </span>
          </Link>
        ) : (
          <div className="rounded-2xl border border-neutral-200/70 bg-white p-4 text-sm text-neutral-600 shadow-sm">
            Your plan doesn&apos;t include hosting yet. Upgrade when Member is
            available.
          </div>
        )}
      </section>

      <section className="mb-10">
        <SectionTitle title="Current gatherings" />
        {upcoming.length === 0 ? (
          <EmptyState
            title="Nothing scheduled"
            body="Your next gathering will live here once you publish it."
          />
        ) : (
          <ul className="space-y-3">
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
                    className="block rounded-2xl border border-neutral-200/80 bg-white p-4 text-sm shadow-sm ring-1 ring-black/[0.03] transition hover:border-gather-accent/40 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-gather-ink">{g.title}</p>
                      {pending > 0 && (
                        <span className="shrink-0 rounded-full bg-gather-brown px-2 py-0.5 text-[11px] font-semibold text-gather-cream shadow-sm">
                          {pending} pending
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">{dateStr}</p>
                    <p className="mt-2 text-xs text-gather-brown-mid">
                      {attending} / {g.maxTotalSize} attending
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle title="Past gatherings & reimbursements" />
        {past.length === 0 ? (
          <EmptyState
            title="Nothing yet"
            body="Finished gatherings and their reimbursement status appear here."
          />
        ) : (
          <ul className="space-y-2">
            {past.map((g) => {
              const approved = g.requests.filter(
                (r) => r.status === GatheringRequestStatus.APPROVED,
              ).length;
              const budget = (approved * 7.5).toFixed(2);
              const sub = g.expenseSubmissions[0];
              let reimburseLabel = "Reimbursement pending";
              if (sub) {
                if (sub.status === "SUBMITTED")
                  reimburseLabel = "Expense submitted";
                if (sub.status === "SENT") reimburseLabel = "Reimbursement sent";
              }
              return (
                <li key={g.id}>
                  <Link
                    href={`/host/${g.id}`}
                    className="block rounded-xl border border-neutral-200/60 bg-gather-paper/50 px-3 py-2.5 text-sm transition hover:bg-white"
                  >
                    <p className="font-medium text-gather-ink">{g.title}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {g.startsAt.toLocaleDateString()} · {approved} attended ·
                      ${budget}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gather-brown-mid">
                      {reimburseLabel}
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

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/40 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-gather-ink">{title}</p>
      <p className="mt-1 text-xs text-neutral-500">{body}</p>
    </div>
  );
}
