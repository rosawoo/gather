import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GatheringRequestStatus } from "@prisma/client";
import Link from "next/link";
import { capacityLine, ageFromDob } from "@/lib/gathering-display";
import { cancelGuestRequestAction } from "@/app/actions/request";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function UpcomingGatheringsPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const requests = await prisma.gatheringRequest.findMany({
    where: { guestId: userId },
    include: {
      gathering: {
        include: {
          host: { include: { profile: true, photos: true, promptAnswers: true } },
          requests: {
            where: { status: GatheringRequestStatus.APPROVED },
            include: {
              guest: {
                include: { profile: true, photos: { orderBy: { sortOrder: "asc" } } },
              },
            },
          },
        },
      },
    },
    orderBy: { gathering: { startsAt: "asc" } },
  });

  const now = new Date();
  const pending = requests.filter(
    (r) =>
      r.status === GatheringRequestStatus.PENDING &&
      r.gathering.startsAt > now &&
      r.gathering.status === "PUBLISHED",
  );
  const approved = requests.filter(
    (r) =>
      r.status === GatheringRequestStatus.APPROVED &&
      r.gathering.startsAt > now &&
      (r.gathering.status === "PUBLISHED" || r.gathering.status === "COMPLETED"),
  );
  const past = requests.filter((r) => r.gathering.startsAt <= now);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gather-ink">Upcoming</h1>

      <Section title="Pending requests">
        {pending.length === 0 ? (
          <p className="text-sm text-neutral-500">None right now.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 text-sm"
              >
                <Link
                  href={`/gatherings/${r.gatheringId}`}
                  className="font-medium text-gather-brown hover:underline"
                >
                  {r.gathering.title}
                </Link>
                <p className="mt-1 text-xs text-neutral-500">
                  {r.gathering.startsAt.toLocaleString()} · Pending
                </p>
                <form action={cancelGuestRequestAction} className="mt-2">
                  <input type="hidden" name="gatheringId" value={r.gatheringId} />
                  <button
                    type="submit"
                    className="text-xs font-medium text-red-700 hover:underline"
                  >
                    Cancel request (tokens return)
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Approved">
        {approved.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing on your calendar yet.</p>
        ) : (
          <ul className="space-y-6">
            {approved.map((r) => {
              const g = r.gathering;
              const host = g.host;
              const hostPrimary =
                host.photos.find((p) => p.isPrimary) ?? host.photos[0];
              const approvedGuests = g.requests;

              return (
                <li
                  key={r.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4 text-sm"
                >
                  <Link
                    href={`/gatherings/${g.id}`}
                    className="font-medium text-gather-brown hover:underline"
                  >
                    {g.title}
                  </Link>
                  <p className="mt-1 text-xs text-neutral-500">
                    {g.startsAt.toLocaleString()} · {g.neighborhood}
                  </p>
                  <p className="mt-2 text-xs text-neutral-600">
                    Exact address is visible on the gathering page.
                  </p>

                  <div className="mt-4 border-t border-neutral-100 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Who&apos;s coming
                    </p>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-center gap-2">
                        {hostPrimary?.url || host.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={hostPrimary?.url ?? host.image!}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-neutral-200" />
                        )}
                        <span>
                          {host.profile?.firstName ?? host.name ?? "Host"}{" "}
                          <span className="text-neutral-400">(host)</span>
                        </span>
                      </li>
                      {approvedGuests.map((gr) => {
                        const gp = gr.guest.profile;
                        const ph =
                          gr.guest.photos.find((p) => p.isPrimary) ??
                          gr.guest.photos[0];
                        if (!gp) return null;
                        return (
                          <li key={gr.id} className="flex items-center gap-2">
                            {ph?.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={ph.url}
                                alt=""
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-neutral-200" />
                            )}
                            <span>
                              {gp.firstName}{" "}
                              <span className="text-neutral-400">
                                · {ageFromDob(gp.dateOfBirth)}
                              </span>
                            </span>
                          </li>
                        );
                      })}
                      {g.hostFriendsCount > 0 ? (
                        <li className="text-xs text-neutral-500">
                          + {g.hostFriendsCount} host friend
                          {g.hostFriendsCount === 1 ? "" : "s"} (not shown)
                        </li>
                      ) : null}
                    </ul>
                  </div>

                  <form action={cancelGuestRequestAction} className="mt-3">
                    <input type="hidden" name="gatheringId" value={g.id} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-neutral-600 hover:underline"
                    >
                      Withdraw (&gt;24h before start returns tokens)
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Past">
        {past.length === 0 ? (
          <p className="text-sm text-neutral-500">No past gatherings yet.</p>
        ) : (
          <ul className="space-y-2">
            {past.map((r) => (
              <li key={r.id} className="text-sm text-neutral-600">
                {r.gathering.title} ·{" "}
                {r.gathering.startsAt.toLocaleDateString()} ·{" "}
                {r.status === GatheringRequestStatus.APPROVED
                  ? "Attended"
                  : r.status}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
