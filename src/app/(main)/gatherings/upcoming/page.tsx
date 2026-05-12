import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GatheringRequestStatus } from "@prisma/client";
import Link from "next/link";
import { ageFromDob } from "@/lib/gathering-display";
import { cancelGuestRequestAction } from "@/app/actions/request";
import { SectionTitle } from "@/components/ui/page-header";
import { ScrapbookFrame } from "@/components/scrapbook-frame";

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
    <div className="relative pb-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 w-full bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,160,108,0.12)_0%,transparent_58%)] blur-2xl"
      />
      <p className="mb-8 text-sm text-gather-cream/65">
        Requests, confirmed plans, and past gatherings.
      </p>

      <section className="mb-10">
        <SectionTitle title="Pending requests" variant="onDark" />
        {pending.length === 0 ? (
          <p className="text-sm text-gather-cream/50">None right now.</p>
        ) : (
          <ul className="space-y-8">
            {pending.map((r) => (
              <li key={r.id} className="list-none">
                <ScrapbookFrame>
                  <div className="rounded-2xl border border-gather-teal/30 bg-white p-4 text-sm shadow-sm ring-1 ring-black/[0.03] transition hover:shadow-md">
                    <Link
                      href={`/gatherings/${r.gatheringId}`}
                      className="font-semibold text-gather-brown transition hover:text-gather-brown-mid hover:underline"
                    >
                      {r.gathering.title}
                    </Link>
                    <p className="mt-1 text-xs text-gather-charcoal/80">
                      {r.gathering.startsAt.toLocaleString()} · Pending
                    </p>
                    <form action={cancelGuestRequestAction} className="mt-2">
                      <input type="hidden" name="gatheringId" value={r.gatheringId} />
                      <button
                        type="submit"
                        className="text-xs font-semibold text-red-700 transition hover:text-red-800 hover:underline"
                      >
                        Cancel request (tokens return)
                      </button>
                    </form>
                  </div>
                </ScrapbookFrame>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <SectionTitle title="Approved" variant="onDark" />
        {approved.length === 0 ? (
          <p className="text-sm text-gather-cream/50">Nothing on your calendar yet.</p>
        ) : (
          <ul className="space-y-10">
            {approved.map((r) => {
              const g = r.gathering;
              const host = g.host;
              const hostPrimary =
                host.photos.find((p) => p.isPrimary) ?? host.photos[0];
              const approvedGuests = g.requests;

              return (
                <li key={r.id} className="list-none">
                  <ScrapbookFrame>
                    <div className="rounded-2xl border border-gather-teal/30 bg-white p-5 text-sm shadow-sm ring-1 ring-black/[0.03] transition hover:shadow-md">
                      <Link
                        href={`/gatherings/${g.id}`}
                        className="font-semibold text-gather-brown transition hover:text-gather-brown-mid hover:underline"
                      >
                        {g.title}
                      </Link>
                      <p className="mt-1 text-xs text-gather-charcoal/80">
                        {g.startsAt.toLocaleString()} · {g.neighborhood}
                      </p>
                      <p className="mt-2 text-xs text-gather-charcoal">
                        Exact address is visible on the gathering page.
                      </p>

                      <div className="mt-4 rounded-xl bg-gather-paper/80 px-3 py-3 ring-1 ring-gather-teal/18">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gather-brown-mid">
                          Who&apos;s coming
                        </p>
                        <ul className="mt-2 space-y-2.5">
                          <li className="flex items-center gap-2.5">
                            {hostPrimary?.url || host.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={hostPrimary?.url ?? host.image!}
                                alt=""
                                className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-gather-line/50 ring-2 ring-white" />
                            )}
                            <span className="text-[15px]">
                              {host.profile?.firstName ?? host.name ?? "Host"}{" "}
                              <span className="text-xs font-medium text-gather-brown-mid">
                                (host)
                              </span>
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
                                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                                  />
                                ) : (
                                  <div className="h-9 w-9 rounded-full bg-gather-line/50 ring-2 ring-white" />
                                )}
                                <span className="text-[15px]">
                                  {gp.firstName}{" "}
                                  <span className="text-xs text-gather-charcoal/80">
                                    · {ageFromDob(gp.dateOfBirth)}
                                  </span>
                                </span>
                              </li>
                            );
                          })}
                          {g.hostFriendsCount > 0 ? (
                            <li className="text-xs text-gather-charcoal/80">
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
                          className="text-xs font-medium text-gather-charcoal transition hover:text-gather-ink hover:underline"
                        >
                          Withdraw (&gt;24h before start returns tokens)
                        </button>
                      </form>
                    </div>
                  </ScrapbookFrame>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle title="Past" variant="onDark" />
        {past.length === 0 ? (
          <p className="text-sm text-gather-cream/50">No past gatherings yet.</p>
        ) : (
          <ul className="space-y-2">
            {past.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-gather-teal/20 bg-gather-paper/50 px-3 py-2.5 text-sm text-gather-ink"
              >
                <span className="font-medium text-gather-ink">
                  {r.gathering.title}
                </span>
                <span className="text-gather-charcoal/80">
                  {" "}
                  · {r.gathering.startsAt.toLocaleDateString()} ·{" "}
                  {r.status === GatheringRequestStatus.APPROVED
                    ? "Attended"
                    : r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
