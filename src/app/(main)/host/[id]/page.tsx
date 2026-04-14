import { auth } from "@/auth";
import { TokenExplainer } from "@/components/token-explainer";
import {
  approveRequestAction,
  denyRequestAction,
} from "@/app/actions/request";
import { cancelGatheringAsHostAction } from "@/app/actions/gathering";
import { submitExpense } from "@/app/actions/expense";
import { prisma } from "@/lib/prisma";
import { capacityLine, ageFromDob } from "@/lib/gathering-display";
import { GatheringRequestStatus, GatheringStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

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

  return (
    <div className="pb-28">
      <Link href="/host" className="text-sm text-gather-brown hover:underline">
        ← Back
      </Link>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold">{g.title}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {g.startsAt.toLocaleString()} · {g.status}
        </p>
        <p className="mt-2 text-sm text-neutral-600">
          {capacityLine(g.minTotalSize, g.maxTotalSize, g.hostFriendsCount)}
        </p>
        <p className="mt-2 text-sm">
          Total attending: {attending} / {g.maxTotalSize} · Pending requests:{" "}
          {pending.length}
        </p>
        <div className="mt-4 border-t border-neutral-100 pt-3">
          <p className="text-xs font-semibold uppercase text-neutral-500">
            Event budget
          </p>
          <p className="mt-1 text-sm">
            Guests approved: {approved.length} · Tokens used: {approved.length}
          </p>
          <p className="text-lg font-semibold text-gather-brown">
            Event budget available: ${budget}
          </p>
          <TokenExplainer className="mt-2" />
        </div>
      </div>

      {!isPast && g.status === GatheringStatus.PUBLISHED && (
        <form action={cancelGatheringAsHostAction} className="mt-4">
          <input type="hidden" name="gatheringId" value={id} />
          <button
            type="submit"
            className="text-sm font-medium text-red-700 hover:underline"
          >
            Cancel gathering (refunds all guests)
          </button>
        </form>
      )}

      {!isPast && (
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Requests
          </h2>
          {pending.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">No pending requests.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {pending.map((r) => {
                const gp = r.guest.profile;
                const ph = r.guest.photos[0];
                if (!gp) return null;
                return (
                  <li
                    key={r.id}
                    className="rounded-xl border border-neutral-200 bg-white p-4"
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
                          className="h-14 w-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-neutral-200" />
                      )}
                      <div>
                        <p className="font-medium text-gather-ink">
                          {gp.firstName} · {ageFromDob(gp.dateOfBirth)}
                        </p>
                        <p className="text-xs text-gather-brown hover:underline">
                          View full profile
                        </p>
                      </div>
                    </Link>
                    {r.comment ? (
                      <p className="mt-3 rounded-lg bg-gather-cream/40 px-3 py-2 text-sm text-neutral-800">
                        {r.comment}
                      </p>
                    ) : null}
                    <div className="mt-4 flex gap-2">
                      <form action={approveRequestAction}>
                        <input type="hidden" name="requestId" value={r.id} />
                        <button
                          type="submit"
                          className="rounded-full bg-gather-brown px-4 py-2 text-sm font-medium text-gather-cream"
                        >
                          Approve
                        </button>
                      </form>
                      <form action={denyRequestAction}>
                        <input type="hidden" name="requestId" value={r.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700"
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

      {isPast && (
        <section className="mt-10 rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Reimbursement
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Guests attended: {approved.length} · Tokens used: {approved.length}{" "}
            · Event budget: ${budget}
          </p>
          <TokenExplainer className="mt-2" />
          <p className="mt-3 text-xs text-neutral-500">
            Reimbursement is the lesser of your receipt total and the event
            budget. Stripe funds token purchases; payouts start as Venmo / Zelle
            per ops review.
          </p>
          {g.expenseSubmissions[0] ? (
            <p className="mt-4 text-sm font-medium">
              Status: {g.expenseSubmissions[0].status}
            </p>
          ) : (
            <form action={submitExpense} className="mt-4 space-y-3">
              <input type="hidden" name="gatheringId" value={g.id} />
              <input
                name="receiptUrl"
                required
                placeholder="Receipt image URL"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              />
              <input
                name="description"
                required
                placeholder="What you bought"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              />
              <input
                name="payoutHandle"
                required
                placeholder="Venmo or Zelle handle"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-full bg-gather-brown px-5 py-2 text-sm font-medium text-gather-cream"
              >
                Submit expense
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
