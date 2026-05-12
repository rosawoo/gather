import { auth } from "@/auth";
import { PolaroidCard } from "@/components/polaroid-card";
import { prisma } from "@/lib/prisma";
import { PERSONALITY_PROMPTS } from "@/lib/prompts";
import { ageFromDob } from "@/lib/gathering-display";
import { GatheringStatus, Plan, GatheringRequestStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MoodBoardAura } from "@/components/mood-board-aura";

function neighborhoodLine(n: string | null | undefined): string | null {
  if (!n?.trim()) return null;
  return n
    .replace(/,\s*Washington,?\s*DC$/i, "")
    .replace(/,\s*DC$/i, "")
    .trim()
    .toLowerCase();
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await auth();
  const viewer = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user!.id },
    select: { plan: true },
  });

  const { userId } = await params;

  const u = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      photos: { orderBy: { sortOrder: "asc" } },
      promptAnswers: true,
      hostedGatherings: {
        where: {
          status: GatheringStatus.PUBLISHED,
          startsAt: { gt: new Date() },
        },
        orderBy: { startsAt: "asc" },
        include: {
          requests: {
            where: {
              status: {
                in: [
                  GatheringRequestStatus.PENDING,
                  GatheringRequestStatus.APPROVED,
                ],
              },
            },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!u?.profile) notFound();

  const primary = u.photos.find((p) => p.isPrimary) ?? u.photos[0];
  const hostImage = primary?.url ?? u.image ?? null;
  const extraPhotos = u.photos.filter((ph) => ph.id !== primary?.id);

  const visibleHosted = u.hostedGatherings.filter((g) => {
    if (viewer.plan === Plan.OBSERVER && g.tokenCost >= 2) return false;
    return true;
  });
  const p = u.profile;
  const age = ageFromDob(p.dateOfBirth);
  const hood = neighborhoodLine(p.neighborhood);
  const subline = [p.college, p.job].filter(Boolean).join(" · ").toLowerCase();

  return (
    <div className="relative -mx-4 min-h-[calc(100dvh-6rem)] bg-gradient-to-b from-lc-profile-gradient-from via-lc-profile-gradient-via to-lc-profile-gradient-to px-5 py-8 pb-28 sm:-mx-6 sm:px-8">
      <Link
        href="/gatherings"
        className="mb-10 inline-flex items-center gap-1 font-serif text-sm lowercase tracking-wide text-lc-pale-blue-border transition hover:text-lc-cream"
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
        discover
      </Link>

      <div className="relative mx-auto max-w-lg">
        {p.moodBoardEnabled ? (
          <div className="pointer-events-none absolute -top-6 left-1/2 z-10 -translate-x-1/2 opacity-90">
            <MoodBoardAura decorJson={p.moodBoardDecor} />
          </div>
        ) : null}

        <header className="pt-4 text-center">
          <div className="relative mx-auto w-fit">
            {primary?.url || u.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primary?.url ?? u.image!}
                alt=""
                className="h-44 w-44 rounded-full object-cover shadow-[0_20px_50px_rgba(0,0,0,0.45)] ring-4 ring-lc-cream/12"
              />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center rounded-full bg-lc-disk-plum font-serif text-sm text-lc-tab-muted">
                no photo
              </div>
            )}
          </div>
          <h1 className="mt-8 font-serif text-3xl font-light lowercase tracking-tight text-lc-cream sm:text-[2.1rem]">
            {p.firstName}, {age}
          </h1>
          {hood ? (
            <p className="mt-2 font-serif text-base lowercase text-lc-soft-rose">
              {hood}
            </p>
          ) : null}
          {subline ? (
            <p className="mt-1 font-serif text-sm lowercase text-lc-earth-muted/90">
              {subline}
            </p>
          ) : null}
        </header>

        {p.bio?.trim() ? (
          <p className="mx-auto mt-14 max-w-md text-center font-serif text-lg italic leading-relaxed text-lc-caption-warm/95">
            {p.bio}
          </p>
        ) : null}

        {visibleHosted.length > 0 ? (
          <section id="their-gatherings" className="mt-16 space-y-3 text-center">
            {visibleHosted.map((g) => (
              <p
                key={g.id}
                className="font-handwriting text-[1.35rem] leading-snug text-lc-verse-dust"
              >
                hosted “{g.title.toLowerCase()}”
              </p>
            ))}
          </section>
        ) : u.hostedGatherings.length > 0 ? (
          <p className="mt-14 text-center font-serif text-sm italic text-lc-tab-muted">
            {viewer.plan === Plan.OBSERVER
              ? "some gatherings aren’t visible on your current plan."
              : "nothing hosted right now."}
          </p>
        ) : null}

        {visibleHosted.length > 0 ? (
          <div className="mt-12 flex flex-col items-center gap-12">
            {visibleHosted.map((g) => {
              const filled = g.hostFriendsCount + g.requests.length;
              const spotsLeft = Math.max(0, g.maxTotalSize - filled);
              return (
                <PolaroidCard
                  key={g.id}
                  variant="static"
                  id={g.id}
                  title={g.title}
                  description={g.description}
                  coverImageUrl={g.coverImageUrl}
                  startsAt={g.startsAt.toISOString()}
                  neighborhood={g.neighborhood}
                  gatheringType={g.gatheringType}
                  minTotalSize={g.minTotalSize}
                  maxTotalSize={g.maxTotalSize}
                  hostFriendsCount={g.hostFriendsCount}
                  tokenCost={g.tokenCost}
                  hostImage={hostImage}
                  hostId={u.id}
                  hostFirstName={p.firstName}
                  hostDateOfBirth={p.dateOfBirth.toISOString()}
                  spotsLeft={spotsLeft}
                />
              );
            })}
          </div>
        ) : null}

        {PERSONALITY_PROMPTS.some((pr) =>
          u.promptAnswers.some((a) => a.promptKey === pr.key),
        ) ? (
          <section className="mt-20 space-y-10">
            {PERSONALITY_PROMPTS.map((pr) => {
              const ans = u.promptAnswers.find((a) => a.promptKey === pr.key);
              if (!ans) return null;
              return (
                <div key={pr.key} className="mx-auto max-w-[min(34ch,88vw)] text-center">
                  <p className="font-serif text-[14px] leading-snug text-lc-earth-muted">
                    {pr.label}
                  </p>
                  <p className="mt-4 max-w-md font-serif text-[17px] font-light italic leading-relaxed text-lc-verse-dust/[0.95] sm:text-lg">
                    {ans.body.trim()}
                  </p>
                </div>
              );
            })}
          </section>
        ) : null}

        {extraPhotos.length > 0 ? (
          <section className="mt-20 space-y-14">
            {extraPhotos.map((ph, i) => (
              <div
                key={ph.id}
                className={`flex ${i % 2 === 0 ? "justify-start pl-2" : "justify-end pr-4"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ph.url}
                  alt=""
                  className="h-48 w-48 rounded-full object-cover shadow-[0_16px_40px_rgba(0,0,0,0.4)] ring-2 ring-lc-cream/10 sm:h-52 sm:w-52"
                />
              </div>
            ))}
          </section>
        ) : null}

        <div className="mt-24 flex flex-col items-center gap-4 pb-6">
          <Link
            href={
              visibleHosted.length
                ? "#their-gatherings"
                : "/gatherings"
            }
            className="inline-flex min-w-[200px] items-center justify-center rounded-md border border-lc-pale-blue-border bg-lc-dusty-blue px-8 py-3 font-serif text-[15px] lowercase tracking-[0.12em] text-lc-cream transition hover:bg-lc-dusty-blue-bright-hover"
          >
            request a seat
          </Link>
          <Link
            href={`/report?type=user&id=${userId}`}
            className="font-serif text-xs lowercase tracking-wide text-lc-earth-muted transition hover:text-lc-pale-blue-border"
          >
            report profile
          </Link>
        </div>
      </div>
    </div>
  );
}
