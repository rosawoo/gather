import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PERSONALITY_PROMPTS } from "@/lib/prompts";
import { ageFromDob } from "@/lib/gathering-display";
import { GatheringStatus } from "@prisma/client";
import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { MoodBoardAura } from "@/components/mood-board-aura";

function neighborhoodLine(n: string | null | undefined): string | null {
  if (!n?.trim()) return null;
  return n
    .replace(/,\s*Washington,?\s*DC$/i, "")
    .replace(/,\s*DC$/i, "")
    .trim()
    .toLowerCase();
}

export default async function ProfilePage() {
  const session = await auth();
  const userId = session!.user!.id;

  const u = await prisma.user.findUniqueOrThrow({
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
        take: 12,
      },
    },
  });

  const primary = u.photos.find((p) => p.isPrimary) ?? u.photos[0];
  const p = u.profile!;
  const extras = u.photos.filter((ph) => ph.id !== primary?.id);
  const age = ageFromDob(p.dateOfBirth);
  const hood = neighborhoodLine(p.neighborhood);
  const subline = [p.college, p.job].filter(Boolean).join(" · ").toLowerCase();

  const promptBlocks = PERSONALITY_PROMPTS.flatMap((pr) => {
    const ans = u.promptAnswers.find((a) => a.promptKey === pr.key);
    if (!ans?.body?.trim()) return [];
    return [{ key: pr.key, label: pr.label, body: ans.body.trim() }];
  });

  const hosted = u.hostedGatherings;
  const zipLen = Math.max(hosted.length, extras.length);

  return (
    <div className="relative -mx-4 min-h-[calc(100dvh-6rem)] bg-gradient-to-b from-lc-profile-gradient-from via-lc-profile-gradient-via to-lc-profile-gradient-to pb-36 pt-12 sm:-mx-6 sm:pb-44 sm:pt-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(184,154,140,0.06)_0%,transparent_62%)]" />

      <div className="relative mx-auto flex max-w-md flex-col px-6 sm:px-10">
        {p.moodBoardEnabled ? (
          <div className="pointer-events-none absolute -top-10 left-1/2 z-10 w-[min(100%,520px)] -translate-x-1/2 opacity-[0.35]">
            <MoodBoardAura decorJson={p.moodBoardDecor} />
          </div>
        ) : null}

        {/* Intro — airy, editorial */}
        <header className="text-center">
          <h1 className="font-display text-[2.125rem] font-light lowercase leading-[1.1] tracking-[-0.02em] text-lc-cream sm:text-[2.35rem]">
            {p.firstName.trim().toLowerCase()}, {age}
          </h1>
          {hood ? (
            <p className="mt-3 font-serif text-[1.05rem] font-normal lowercase leading-snug tracking-[0.01em] text-lc-soft-rose/88">
              {hood}
            </p>
          ) : null}
          {subline ? (
            <p className="mt-2 font-serif text-[15px] font-light lowercase tracking-wide text-lc-earth-muted/85">
              {subline}
            </p>
          ) : null}
        </header>

        <div className="mx-auto mt-20 flex w-[min(19rem,min(74vw,20rem))] shrink-0 flex-col items-center gap-3 sm:mt-[5.25rem] sm:w-[min(21rem,80vw)]">
          <div className="w-full">
            {primary?.url || u.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primary?.url ?? u.image!}
                alt=""
                className="aspect-square w-full rounded-full object-cover shadow-[0_24px_60px_rgba(0,0,0,0.42)] ring-1 ring-lc-cream/[0.14]"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-full bg-lc-disk-plum font-serif text-sm lowercase italic text-lc-tab-muted ring-1 ring-lc-cream/[0.1]">
                add a portrait from edit profile
              </div>
            )}
          </div>
          <Link
            href="/profile/edit#profile-photos"
            className="font-serif text-sm font-light lowercase tracking-[0.12em] text-lc-earth-muted underline decoration-from-font underline-offset-[5px] transition hover:text-lc-caption-warm"
          >
            change photo
          </Link>
        </div>

        {p.bio?.trim() ? (
          <p className="mx-auto mt-16 max-w-[26ch] text-center font-serif text-lg font-light italic leading-relaxed tracking-[0.01em] text-lc-caption-warm/93 sm:mt-[4.25rem] sm:text-xl sm:leading-[1.6]">
            {p.bio.trim()}
          </p>
        ) : null}

        {/* Personality excerpts — spaced like margin notes */}
        {promptBlocks.length > 0 ? (
          <div className={`${p.bio?.trim() ? "mt-20" : "mt-24"} space-y-[4.75rem]`}>
            {promptBlocks.map((block) => (
              <div
                key={block.key}
                className="mx-auto max-w-[min(34ch,88vw)] text-center sm:max-w-[36ch]"
              >
                <p className="font-serif text-[14px] font-normal leading-snug tracking-[0.02em] text-lc-earth-muted">
                  {block.label}
                </p>
                <p className="mt-4 font-serif text-[17px] font-light italic leading-[1.55] tracking-[0.01em] text-lc-verse-dust/[0.96] sm:text-lg">
                  {block.body}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {/* Hosted moments + staggered circles — scrapbook rhythm */}
        {zipLen > 0 ? (
          <div className={`${promptBlocks.length > 0 || p.bio?.trim() ? "mt-28" : "mt-28"} flex flex-col gap-[4.75rem]`}>
            {Array.from({ length: zipLen }, (_, i) => {
              const g = hosted[i];
              const ph = extras[i];
              const staggerRight = i % 2 === 1;
              return (
                <div key={`zip-${i}`} className="flex flex-col gap-[4.75rem]">
                  {g ? (
                    <p className="mx-auto max-w-[28ch] text-center font-handwriting text-[1.375rem] leading-snug lowercase text-lc-caption-warm/94 sm:text-[1.55rem] sm:leading-[1.35]">
                      hosted “{g.title.toLowerCase()}”
                    </p>
                  ) : null}
                  {ph ? (
                    <div
                      className={
                        staggerRight
                          ? "flex justify-end pr-[7%]"
                          : "flex justify-start pl-[4%]"
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ph.url}
                        alt=""
                        className={
                          staggerRight && i % 3 === 1
                            ? "h-[10.75rem] w-[10.75rem] rounded-full object-cover shadow-[0_14px_40px_rgba(0,0,0,0.38)] ring-1 ring-lc-cream/[0.1] sm:h-[13rem] sm:w-[13rem]"
                            : "h-[11.75rem] w-[11.75rem] rounded-full object-cover shadow-[0_14px_40px_rgba(0,0,0,0.38)] ring-1 ring-lc-cream/[0.1] sm:h-[13.75rem] sm:w-[13.75rem]"
                        }
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Trailing photos if more images than hosted captions */}
        {extras.length > hosted.length ? (
          <div className="mt-24 flex flex-col gap-[5rem]">
            {extras.slice(hosted.length).map((ph, j) => {
              const staggerRight = (hosted.length + j) % 2 === 1;
              return (
                <div
                  key={ph.id}
                  className={
                    staggerRight
                      ? "flex justify-end pr-[5%]"
                      : "flex justify-start pl-[8%]"
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ph.url}
                    alt=""
                    className="h-[11rem] w-[11rem] rounded-full object-cover shadow-[0_14px_40px_rgba(0,0,0,0.36)] ring-1 ring-lc-cream/[0.1] sm:h-[13rem] sm:w-[13rem]"
                  />
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Quiet utility prose — no cards */}
        <p className="mx-auto mt-20 max-w-sm text-center font-serif text-[14px] font-light lowercase leading-relaxed tracking-wide text-lc-earth-muted">
          <span className="text-lc-caption-warm/90 tabular-nums">{u.tokensAvailable}</span>
          {" · "}
          <Link href="/profile/tokens" className="underline decoration-from-font underline-offset-[4px] transition hover:text-lc-caption-warm">
            tokens
          </Link>
          {u.tokensHeld > 0 ? (
            <>
              {" · "}
              <span className="tabular-nums">{u.tokensHeld}</span> held on requests
            </>
          ) : null}
          {" · plan "}
          <span className="lowercase text-lc-tab-muted">{u.plan}</span>
        </p>

        <div className="-mx-6 mt-16 flex justify-center overflow-x-auto px-6 pb-1 sm:-mx-10 sm:px-10">
          <nav
            className="inline-flex shrink-0 flex-nowrap items-center gap-x-2.5 font-serif text-sm font-light lowercase tracking-[0.06em] text-lc-earth-muted sm:gap-x-3 sm:tracking-[0.08em]"
            aria-label="Profile shortcuts"
          >
            <Link
              href="/profile/edit"
              className="shrink-0 whitespace-nowrap transition hover:text-lc-caption-warm"
            >
              edit profile
            </Link>
            <span className="shrink-0 opacity-35" aria-hidden>
              ·
            </span>
            <Link
              href="/profile/notifications"
              className="shrink-0 whitespace-nowrap transition hover:text-lc-caption-warm"
            >
              notifications
            </Link>
            <span className="shrink-0 opacity-35" aria-hidden>
              ·
            </span>
            <Link
              href="/profile/settings"
              className="shrink-0 whitespace-nowrap transition hover:text-lc-caption-warm"
            >
              settings
            </Link>
            <span className="shrink-0 opacity-35" aria-hidden>
              ·
            </span>
            <Link
              href="/report"
              className="shrink-0 whitespace-nowrap transition hover:text-lc-caption-warm"
            >
              report an issue
            </Link>
          </nav>
        </div>

        <form action={signOutAction} className="mx-auto mt-10">
          <button
            type="submit"
            className="font-serif text-[12px] font-light lowercase tracking-[0.2em] text-lc-tab-muted/70 transition hover:text-lc-earth-muted sm:text-[13px]"
          >
            sign out
          </button>
        </form>
      </div>
    </div>
  );
}
