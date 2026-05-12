import { auth } from "@/auth";
import { TokenExplainer } from "@/components/token-explainer";
import { prisma } from "@/lib/prisma";
import { capacityLine, ageFromDob } from "@/lib/gathering-display";
import { GatheringRequestStatus, GatheringStatus, Plan } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JoinRequestForm } from "./join-form";
import { SectionTitle } from "@/components/ui/page-header";
import { CoverArt } from "@/components/cover-art";
import { ScrapbookFrame } from "@/components/scrapbook-frame";

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

  const dateStr = g.startsAt.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const timeStr = g.startsAt.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="relative pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-72 max-w-2xl bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,160,108,0.12)_0%,transparent_58%)] blur-2xl"
      />
      <Link
        href="/gatherings"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gather-cream/70 transition hover:text-gather-cream"
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
        Discover
      </Link>

      <ScrapbookFrame>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
        <div className="aspect-[16/9] w-full bg-neutral-100">
          <CoverArt cover={g.coverImageUrl} title={g.title} eager />
        </div>
        <div className="space-y-4 p-5">
          <div>
            <h1 className="font-handwriting text-3xl font-medium leading-tight tracking-tight text-gather-ink sm:text-4xl">
              {g.title}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              {dateStr} at {timeStr} · {g.neighborhood}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-gather-ink/90">
            {g.description}
          </p>

          {canSeePrivate || isHost ? (
            <p className="rounded-xl bg-gather-cream/60 px-3 py-2 text-sm ring-1 ring-gather-accent/20">
              <span className="font-semibold text-gather-brown">Address · </span>
              {g.addressSecret}
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Fact label="Group size">
              {capacityLine(g.minTotalSize, g.maxTotalSize, g.hostFriendsCount)}
            </Fact>
            <Fact label="Cost">
              {g.tokenCost === 0
                ? "Free to join"
                : `${g.tokenCost} token${g.tokenCost === 1 ? "" : "s"}`}
            </Fact>
          </div>

          {g.budgetExplanation ? (
            <p className="rounded-xl bg-gather-paper/70 px-3 py-2 text-sm text-neutral-700 ring-1 ring-neutral-200/60">
              <span className="font-semibold text-gather-brown-mid">
                Event budget ·{" "}
              </span>
              {g.budgetExplanation}
            </p>
          ) : null}

          {isHost ? (
            <Link
              href={`/host/${g.id}`}
              className="inline-flex rounded-full border border-gather-brown px-4 py-2 text-sm font-semibold text-gather-brown transition hover:bg-gather-brown hover:text-gather-cream"
            >
              Manage gathering
            </Link>
          ) : (
            <Link
              href={`/u/${g.hostId}`}
              className="inline-flex rounded-full border border-gather-brown px-4 py-2 text-sm font-semibold text-gather-brown transition hover:bg-gather-brown hover:text-gather-cream"
            >
              About the host →
            </Link>
          )}

          <div className="space-y-3 border-t border-neutral-100 pt-4">
            {!canSeePrivate && !isHost ? (
              <ul className="space-y-1.5 text-sm italic text-neutral-500">
                <li>
                  Exact address and list of other gatherers shared after approval.
                </li>
                <li>
                  Tokens are held while the host reviews. If approved, tokens are
                  used. If not a match, they return. Tokens are for cost-sharing,
                  not profit.
                </li>
              </ul>
            ) : null}
            <p className="text-xs text-neutral-500">
              If the minimum group size isn&apos;t reached two hours before the
              event, the gathering is automatically cancelled.
            </p>
            <TokenExplainer />
          </div>
        </div>
      </div>
      </ScrapbookFrame>

      {(canSeePrivate || isHost) && (
        <section className="mt-8">
          <SectionTitle title="Who's coming" variant="onDark" />
          <div className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm ring-1 ring-black/[0.02]">
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                {g.host.photos[0]?.url || g.host.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.host.photos[0]?.url ?? g.host.image!}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-neutral-200 ring-2 ring-white" />
                )}
                <span>
                  {g.host.profile?.firstName ?? g.host.name}{" "}
                  <span className="text-xs font-medium text-gather-brown-mid">
                    (host)
                  </span>
                </span>
              </li>
              {g.requests.map((r) => {
                const gp = r.guest.profile;
                const ph = r.guest.photos[0];
                if (!gp) return null;
                return (
                  <li key={r.id} className="flex items-center gap-2.5">
                    {ph?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ph.url}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-neutral-200 ring-2 ring-white" />
                    )}
                    <span>
                      {gp.firstName}{" "}
                      <span className="text-xs text-neutral-500">
                        · {ageFromDob(gp.dateOfBirth)}
                      </span>
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
              <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
                Event budget available: ${budgetDollars} ($7.50 per approved
                guest token)
              </p>
            ) : null}
          </div>
        </section>
      )}

      {!isHost &&
        g.status === GatheringStatus.PUBLISHED &&
        g.startsAt > new Date() && (
          <div className="mt-8">
            {!myRequest ? (
              <JoinRequestForm gatheringId={g.id} tokenCost={g.tokenCost} />
            ) : myRequest.status === GatheringRequestStatus.PENDING ? (
              <StatusNote tone="neutral">
                Your request is pending. You can cancel from Upcoming.
              </StatusNote>
            ) : myRequest.status === GatheringRequestStatus.APPROVED ? (
              <StatusNote tone="approved">You&apos;re approved.</StatusNote>
            ) : (
              <StatusNote tone="neutral">
                You weren&apos;t selected for this gathering.
              </StatusNote>
            )}
          </div>
        )}

      <div className="mt-10 text-center">
        <Link
          href={`/report?type=gathering&id=${g.id}`}
          className="text-xs text-gather-cream/45 transition hover:text-gather-cream hover:underline"
        >
          Report this gathering
        </Link>
      </div>
    </div>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200/70 bg-gather-paper/60 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gather-brown-mid">
        {label}
      </p>
      <p className="mt-1 text-sm text-gather-ink">{children}</p>
    </div>
  );
}

function StatusNote({
  tone,
  children,
}: {
  tone: "approved" | "neutral";
  children: React.ReactNode;
}) {
  const styles =
    tone === "approved"
      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
      : "bg-gather-paper/70 text-neutral-700 ring-1 ring-neutral-200/70";
  return (
    <p className={`rounded-2xl px-4 py-3 text-sm ${styles}`}>{children}</p>
  );
}
