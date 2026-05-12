import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  GatheringRequestStatus,
  GatheringStatus,
  Plan,
} from "@prisma/client";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/page-header";

const parchmentCard =
  "rounded-2xl border border-lc-pale-blue-border/50 bg-lc-settings-parchment-soft shadow-[0_18px_48px_-34px_rgb(34_26_26_/_0.55)] ring-1 ring-black/[0.04] backdrop-blur-[1px]";

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
    <div className="mx-auto max-w-xl pb-10 font-serif">
      {canHost ? (
        <div className="flex justify-center px-1 pt-1">
          <Link
            href="/host/new"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gather-accent px-7 py-3.5 font-serif text-[15px] font-semibold tracking-[0.04em] text-gather-cream shadow-[0_10px_32px_-12px_rgb(80_45_38_/_0.55)] transition hover:bg-gather-brown-mid hover:shadow-[0_14px_36px_-14px_rgb(70_40_34_/_0.48)] active:scale-[0.99] sm:min-h-[52px] sm:w-auto sm:px-10"
          >
            Start a new gathering
          </Link>
        </div>
      ) : (
        <div
          className={`${parchmentCard} font-sans p-5 text-[15px] leading-relaxed text-lc-settings-helper`}
        >
          <span className="font-semibold text-lc-settings-ink-strong">
            Hosting isn&apos;t on your plan yet.
          </span>{" "}
          Upgrade when Member is available.
        </div>
      )}

      <section className="mb-12 mt-8">
        <SectionTitle title="Current gatherings" variant="hostShell" />
        {upcoming.length === 0 ? (
          <EmptyState
            title="No gatherings yet"
            subtitle="Start one when you’re ready to set the table."
            body="Published dates and RSVP counts will settle in here."
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
                    className={`block p-5 font-sans transition ${parchmentCard} hover:border-lc-muted-tan/55 hover:shadow-[0_22px_48px_-30px_rgb(60_45_40_/_0.28)]`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[17px] font-semibold leading-snug text-lc-settings-ink-strong">
                        {g.title}
                      </p>
                      {pending > 0 ? (
                        <span className="shrink-0 rounded-full bg-gather-accent px-3 py-1 font-sans text-[12px] font-semibold text-gather-cream shadow-sm">
                          {pending} pending
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 font-sans text-[14px] text-lc-settings-helper">
                      {dateStr}
                    </p>
                    <p className="mt-2 font-sans text-[14px] font-medium text-lc-meta-label">
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
        <SectionTitle
          title="Past gatherings & reimbursements"
          variant="hostShell"
        />
        {past.length === 0 ? (
          <EmptyState
            title="Nothing in the ledger yet"
            subtitle="Past tables & reimbursements appear here."
            body="Finished gatherings show headcount and payout status."
          />
        ) : (
          <ul className="space-y-3">
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
                    className={`block px-4 py-4 font-sans transition sm:px-5 ${parchmentCard} hover:border-lc-muted-tan/50 hover:bg-[rgb(246_243_239_/_0.98)]`}
                  >
                    <p className="text-[15px] font-semibold text-lc-settings-ink-strong">
                      {g.title}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-snug text-lc-settings-helper">
                      {g.startsAt.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {approved} attended · ${budget}
                    </p>
                    <p className="mt-2 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-lc-meta-label">
                      {reimburseLabel}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {canHost ? (
        <p className="mx-auto mt-12 max-w-md px-2 text-center font-sans text-[13px] leading-[1.5] text-[rgb(244_238_231_/0.82)] italic">
          *By creating this gathering, I affirm that any funds collected are
          intended solely for shared costs and not for personal profit.
        </p>
      ) : null}
    </div>
  );
}

function EmptyState({
  title,
  subtitle,
  body,
}: {
  title: string;
  subtitle: string;
  body: string;
}) {
  return (
    <div
      className={`${parchmentCard} px-6 py-10 text-center sm:px-10 sm:py-12`}
    >
      <p className="text-[18px] font-semibold leading-snug tracking-tight text-lc-settings-ink-strong">
        {title}
      </p>
      <p className="mt-4 font-handwriting text-[1.375rem] leading-snug lowercase text-lc-muted-tan">
        {subtitle}
      </p>
      <p className="mx-auto mt-4 max-w-[28ch] font-sans text-[14px] leading-[1.45] text-lc-settings-helper">
        {body}
      </p>
    </div>
  );
}
