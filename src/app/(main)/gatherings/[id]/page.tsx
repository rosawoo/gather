import { auth } from "@/auth";
import { TokenExplainer } from "@/components/token-explainer";
import { prisma } from "@/lib/prisma";
import { capacityLine, ageFromDob } from "@/lib/gathering-display";
import { GatheringRequestStatus, GatheringStatus, Plan } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JoinRequestForm } from "./join-form";

export default async function GatheringDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const g = await prisma.gathering.findUnique({
    where: { id },
    include: {
      host: {
        include: {
          profile: true,
          photos: { orderBy: { sortOrder: "asc" } },
          promptAnswers: true,
        },
      },
      requests: {
        where: { status: GatheringRequestStatus.APPROVED },
        include: {
          guest: {
            include: { profile: true, photos: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });

  if (!g) notFound();

  if (user.plan === Plan.OBSERVER && g.tokenCost >= 2) notFound();

  const myRequest = await prisma.gatheringRequest.findUnique({
    where: { gatheringId_guestId: { gatheringId: id, guestId: userId } },
  });

  const canSeePrivate =
    myRequest?.status === GatheringRequestStatus.APPROVED &&
    g.status === GatheringStatus.PUBLISHED;
  const isHost = g.hostId === userId;

  const approvedCount = g.requests.length;
  const budgetDollars = (approvedCount * 7.5).toFixed(2);

  return (
    <div className="px-4 pb-28">
      <Link
        href="/gatherings"
        className="mb-4 inline-block text-sm text-gather-brown hover:underline"
      >
        ← Discover
      </Link>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/80">
        {g.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={g.coverImageUrl}
            alt=""
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center bg-neutral-200 text-sm text-neutral-500">
            No cover image
          </div>
        )}
        <div className="space-y-3 p-5">
          <h1 className="text-2xl font-semibold leading-tight">{g.title}</h1>
          <p className="text-sm text-neutral-600">{g.description}</p>
          <p className="text-sm">
            <span className="text-neutral-500">When ·</span>{" "}
            {g.startsAt.toLocaleString()}
          </p>
          <p className="text-sm">
            <span className="text-neutral-500">Where ·</span> {g.neighborhood}
          </p>
          {canSeePrivate || isHost ? (
            <p className="rounded-lg bg-gather-cream/50 px-3 py-2 text-sm">
              <span className="font-medium">Address ·</span> {g.addressSecret}
            </p>
          ) : (
            <p className="text-sm italic text-neutral-500">
              Exact address shared after approval.
            </p>
          )}
          <p className="text-sm text-neutral-600">
            {capacityLine(g.minTotalSize, g.maxTotalSize, g.hostFriendsCount)}
          </p>
          <p className="text-sm text-neutral-600">
            If the minimum group size isn&apos;t reached two hours before the
            event, the gathering is automatically cancelled.
          </p>
          <div>
            <p className="text-sm font-medium text-gather-ink">
              {g.tokenCost === 0
                ? "Free to join"
                : `${g.tokenCost} token${g.tokenCost === 1 ? "" : "s"}`}
            </p>
            <TokenExplainer className="mt-1" />
          </div>
          {g.budgetExplanation ? (
            <p className="text-sm text-neutral-700">
              <span className="font-medium">Event budget ·</span>{" "}
              {g.budgetExplanation}
            </p>
          ) : null}
          {isHost ? (
            <Link
              href={`/host/${g.id}`}
              className="inline-block rounded-full border border-gather-brown px-4 py-2 text-sm font-medium text-gather-brown"
            >
              Manage gathering
            </Link>
          ) : (
            <Link
              href={`/u/${g.hostId}`}
              className="inline-block rounded-full border border-gather-brown px-4 py-2 text-sm font-medium text-gather-brown"
            >
              About the host
            </Link>
          )}
        </div>
      </div>

      {(canSeePrivate || isHost) && (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Who&apos;s coming
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              {g.host.photos[0]?.url || g.host.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={g.host.photos[0]?.url ?? g.host.image!}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-neutral-200" />
              )}
              <span>
                {g.host.profile?.firstName ?? g.host.name} (host)
              </span>
            </li>
            {g.requests.map((r) => {
              const gp = r.guest.profile;
              const ph = r.guest.photos[0];
              if (!gp) return null;
              return (
                <li key={r.id} className="flex items-center gap-2">
                  {ph?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ph.url}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-neutral-200" />
                  )}
                  <span>
                    {gp.firstName} · {ageFromDob(gp.dateOfBirth)}
                  </span>
                </li>
              );
            })}
            {g.hostFriendsCount > 0 ? (
              <li className="text-xs text-neutral-500">
                + {g.hostFriendsCount} host friend
                {g.hostFriendsCount === 1 ? "" : "s"} (profiles not shown)
              </li>
            ) : null}
          </ul>
          {isHost ? (
            <p className="mt-3 text-xs text-neutral-500">
              Event budget available: ${budgetDollars} ($7.50 per approved guest
              token)
            </p>
          ) : null}
        </div>
      )}

      {!isHost &&
        g.status === GatheringStatus.PUBLISHED &&
        g.startsAt > new Date() && (
          <div className="mt-6">
            {!myRequest ? (
              <JoinRequestForm gatheringId={g.id} tokenCost={g.tokenCost} />
            ) : myRequest.status === GatheringRequestStatus.PENDING ? (
              <p className="text-sm text-neutral-600">
                Your request is pending. You can cancel from Upcoming.
              </p>
            ) : myRequest.status === GatheringRequestStatus.APPROVED ? (
              <p className="text-sm text-emerald-800">You&apos;re approved.</p>
            ) : (
              <p className="text-sm text-neutral-600">
                You weren&apos;t selected for this gathering.
              </p>
            )}
          </div>
        )}

      <div className="mt-8">
        <Link
          href={`/report?type=gathering&id=${g.id}`}
          className="text-xs text-neutral-500 hover:underline"
        >
          Report this gathering
        </Link>
      </div>
    </div>
  );
}
