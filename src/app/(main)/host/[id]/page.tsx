import { auth } from "@/auth";
import {
  approveRequestAction,
  denyRequestAction,
} from "@/app/actions/request";
import { cancelGatheringAsHostAction } from "@/app/actions/gathering";
import { submitExpense } from "@/app/actions/expense";
import { prisma } from "@/lib/prisma";
import { ageFromDob } from "@/lib/gathering-display";
import { GatheringRequestStatus, GatheringStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/ui/page-header";

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Open",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  AUTO_CANCELLED: "Auto-cancelled",
};

export default async function HostManageGatheringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id;

  const g = await prisma.gathering.findUnique({
    where: { id },
    include: {
      requests: {
        include: {
          guest: {
            include: {
              profile: true,
              photos: { orderBy: { sortOrder: "asc" } },
              promptAnswers: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      expenseSubmissions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!g || g.hostId !== userId) notFound();

  const approved = g.requests.filter(
    (r) => r.status === GatheringRequestStatus.APPROVED,
  );
  const pending = g.requests.filter(
    (r) => r.status === GatheringRequestStatus.PENDING,
  );
  const attending = g.hostFriendsCount + approved.length;
  const budget = (approved.length * 7.5).toFixed(2);
  const now = new Date();
  const isPast = g.startsAt <= now;
  const isActive = g.status === GatheringStatus.PUBLISHED;
  const isCancelled =
    g.status === GatheringStatus.CANCELLED ||
    g.status === GatheringStatus.AUTO_CANCELLED;

  const dateStr = g.startsAt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = g.startsAt.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="pb-10">
      <Link
        href="/host"
        className="inline-flex items-center gap-1 text-sm text-gather-brown-mid transition hover:text-gather-brown"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </Link>

      <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div className="h-2 bg-gather-brown" />

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-serif text-2xl font-light leading-tight tracking-tight text-gather-ink sm:text-3xl">
              {g.title}
            </h1>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                isActive
                  ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                  : isCancelled
                    ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                    : isPast
                      ? "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
              }`}
            >
              {statusLabel[g.status] ?? g.status}
            </span>
          </div>

          <p className="mt-2 text-sm text-neutral-500">
            {dateStr} at {timeStr} · {g.neighborhood}
          </p>

          <div className="my-5 border-t border-neutral-100" />

          <div className="grid grid-cols-3 gap-4 text-center">
            <Stat
              value={
                <>
                  {attending}
                  <span className="text-base font-normal text-neutral-300">
                    /{g.maxTotalSize}
                  </span>
                </>
              }
              label="Attending"
            />
            <Stat value={pending.length} label="Pending" />
            <Stat value={`$${budget}`} label="Budget" accent />
          </div>

          {g.minTotalSize > 1 && (
            <p className="mt-4 text-center text-xs text-neutral-500">
              Min {g.minTotalSize} needed
              {attending < g.minTotalSize ? " — not yet met" : " — met"}
              {g.hostFriendsCount > 0 &&
                ` · incl. ${g.hostFriendsCount} host friend${g.hostFriendsCount > 1 ? "s" : ""}`}
            </p>
          )}

          {!isPast && isActive && (
            <>
              <div className="my-5 border-t border-neutral-100" />
              <form action={cancelGatheringAsHostAction}>
                <input type="hidden" name="gatheringId" value={id} />
                <button
                  type="submit"
                  className="text-sm font-semibold text-red-600 transition hover:text-red-700"
                >
                  Cancel gathering
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {!isPast && (
        <section className="mt-10">
          <SectionTitle title="Requests" />
          {pending.length === 0 ? (
            <p className="text-sm text-neutral-500">No pending requests.</p>
          ) : (
            <ul className="space-y-3">
              {pending.map((r) => {
                const gp = r.guest.profile;
                const ph = r.guest.photos[0];
                if (!gp) return null;
                return (
                  <li
                    key={r.id}
                    className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm ring-1 ring-black/[0.02]"
                  >
                    <Link
                      href={`/u/${r.guestId}`}
                      className="flex items-start gap-3"
                    >
                      {ph?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ph.url}
                          alt=""
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-neutral-200" />
                      )}
                      <div>
                        <p className="font-semibold text-gather-ink">
                          {gp.firstName} · {ageFromDob(gp.dateOfBirth)}
                        </p>
                        <p className="text-xs text-gather-brown-mid transition group-hover:text-gather-brown hover:underline">
                          View full profile →
                        </p>
                      </div>
                    </Link>
                    {r.comment ? (
                      <p className="mt-3 rounded-xl bg-gather-cream/50 px-3 py-2 text-sm leading-relaxed text-gather-ink">
                        {r.comment}
                      </p>
                    ) : null}
                    <div className="mt-4 flex gap-2">
                      <form action={approveRequestAction}>
                        <input type="hidden" name="requestId" value={r.id} />
                        <button
                          type="submit"
                          className="rounded-full bg-gather-brown px-4 py-2 text-sm font-semibold text-gather-cream shadow-sm transition hover:bg-gather-brown-mid active:scale-[0.98]"
                        >
                          Approve
                        </button>
                      </form>
                      <form action={denyRequestAction}>
                        <input type="hidden" name="requestId" value={r.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                        >
                          Not selected
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {approved.length > 0 && (
        <section className="mt-10">
          <SectionTitle title="Approved guests" />
          <ul className="space-y-2">
            {approved.map((r) => {
              const gp = r.guest.profile;
              const ph = r.guest.photos[0];
              if (!gp) return null;
              return (
                <li key={r.id}>
                  <Link
                    href={`/u/${r.guestId}`}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-200/70 bg-white p-3 shadow-sm transition hover:border-gather-accent/40 hover:shadow-md"
                  >
                    {ph?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ph.url}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-neutral-200" />
                    )}
                    <div className="text-sm">
                      <p className="font-semibold text-gather-ink">
                        {gp.firstName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {ageFromDob(gp.dateOfBirth)} · Approved
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {isPast && (
        <section className="mt-10">
          <SectionTitle title="Reimbursement" />
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm ring-1 ring-black/[0.02]">
            <p className="text-sm text-neutral-700">
              {approved.length} guest{approved.length !== 1 ? "s" : ""} attended
              · ${budget} budget
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Submit a receipt up to the budget amount. Payouts via Venmo or
              Zelle.
            </p>
            {g.expenseSubmissions[0] ? (
              <p className="mt-4 text-sm font-semibold text-gather-brown">
                {g.expenseSubmissions[0].status === "SENT"
                  ? "Reimbursement sent"
                  : g.expenseSubmissions[0].status === "SUBMITTED"
                    ? "Expense submitted — awaiting payout"
                    : "Reimbursement pending"}
              </p>
            ) : (
              <form action={submitExpense} className="mt-4 space-y-3">
                <input type="hidden" name="gatheringId" value={g.id} />
                <input
                  name="receiptUrl"
                  required
                  placeholder="Receipt image URL"
                  className={inlineInput}
                />
                <input
                  name="description"
                  required
                  placeholder="What you bought"
                  className={inlineInput}
                />
                <input
                  name="payoutHandle"
                  required
                  placeholder="Venmo or Zelle handle"
                  className={inlineInput}
                />
                <button
                  type="submit"
                  className="rounded-full bg-gather-brown px-5 py-2.5 text-sm font-semibold text-gather-cream shadow-sm transition hover:bg-gather-brown-mid active:scale-[0.98]"
                >
                  Submit expense
                </button>
              </form>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-2xl font-semibold tabular-nums ${accent ? "text-gather-brown" : "text-gather-ink"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </p>
    </div>
  );
}

const inlineInput =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-gather-ink outline-none transition placeholder:text-neutral-400 focus:border-gather-accent focus:ring-2 focus:ring-gather-accent/40";
