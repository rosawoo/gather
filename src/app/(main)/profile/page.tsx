import { auth } from "@/auth";
import { TokenExplainer } from "@/components/token-explainer";
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
        take: 5,
      },
    },
  });

  const primary = u.photos.find((p) => p.isPrimary) ?? u.photos[0];
  const p = u.profile!;
  const extraPhotos = u.photos.filter((ph) => ph.id !== primary?.id);
  const age = ageFromDob(p.dateOfBirth);
  const hood = neighborhoodLine(p.neighborhood);
  const subline = [p.college, p.job].filter(Boolean).join(" · ").toLowerCase();

  return (
    <div className="relative -mx-4 min-h-[calc(100dvh-6rem)] bg-gradient-to-b from-[#1f0d10] via-[#2a1216] to-[#160808] px-5 py-8 pb-28 sm:-mx-6 sm:px-8">
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
                className="h-44 w-44 rounded-full object-cover shadow-[0_20px_50px_rgba(0,0,0,0.45)] ring-4 ring-[#f4eee7]/12"
              />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center rounded-full bg-[#3d2528] font-serif text-sm text-[#9c8474]">
                no photo
              </div>
            )}
          </div>
          <h1 className="mt-8 font-serif text-3xl font-light lowercase tracking-tight text-[#f4eee7] sm:text-[2.1rem]">
            {p.firstName}, {age}
          </h1>
          {hood ? (
            <p className="mt-2 font-serif text-base lowercase text-[#b89a8c]">
              {hood}
            </p>
          ) : null}
          {subline ? (
            <p className="mt-1 font-serif text-sm lowercase text-[#8f7268]/90">
              {subline}
            </p>
          ) : null}
        </header>

        {p.bio?.trim() ? (
          <p className="mx-auto mt-14 max-w-md text-center font-serif text-lg italic leading-relaxed text-[#e8ddd2]/95">
            {p.bio}
          </p>
        ) : null}

        {u.hostedGatherings.length > 0 ? (
          <section className="mt-16 space-y-3 text-center">
            {u.hostedGatherings.map((g) => (
              <p
                key={g.id}
                className="font-handwriting text-[1.35rem] leading-snug text-[#d4c4b8]"
              >
                hosting “{g.title.toLowerCase()}”
              </p>
            ))}
          </section>
        ) : null}

        {PERSONALITY_PROMPTS.some((pr) =>
          u.promptAnswers.some((a) => a.promptKey === pr.key),
        ) ? (
          <section className="mt-20 space-y-6">
            {PERSONALITY_PROMPTS.map((pr) => {
              const ans = u.promptAnswers.find((a) => a.promptKey === pr.key);
              if (!ans) return null;
              return (
                <p
                  key={pr.key}
                  className="max-w-md font-serif text-base italic leading-relaxed text-[#d4c4b8]/95"
                >
                  {ans.body}
                </p>
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
                  className="h-48 w-48 rounded-full object-cover shadow-[0_16px_40px_rgba(0,0,0,0.4)] ring-2 ring-[#f4eee7]/10 sm:h-52 sm:w-52"
                />
              </div>
            ))}
          </section>
        ) : null}

        <section className="mt-20 rounded-2xl border border-[#f4eee7]/12 bg-[#1a0a0c]/80 px-5 py-6 text-[#f4eee7] backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-serif text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c4a99a]">
              tokens
            </h2>
            <span className="rounded-full bg-[#f4eee7]/10 px-2.5 py-0.5 font-serif text-[10px] uppercase tracking-wider text-[#e8ddd2]">
              {u.plan}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-black/25 px-3 py-3 text-center ring-1 ring-white/5">
              <p className="font-serif text-3xl font-light tabular-nums text-[#f4eee7]">
                {u.tokensAvailable}
              </p>
              <p className="mt-0.5 font-serif text-[10px] uppercase tracking-[0.14em] text-[#b89a8c]">
                available
              </p>
            </div>
            <div className="rounded-xl bg-black/25 px-3 py-3 text-center ring-1 ring-white/5">
              <p className="font-serif text-3xl font-light tabular-nums text-[#f4eee7]">
                {u.tokensHeld}
              </p>
              <p className="mt-0.5 font-serif text-[10px] uppercase tracking-[0.14em] text-[#b89a8c]">
                held
              </p>
            </div>
          </div>
          <TokenExplainer variant="onDark" className="mt-4" />
          <Link
            href="/profile/tokens"
            className="mt-5 flex w-full items-center justify-center rounded-md border border-[#c6d8e3] bg-[#266b7e] py-3 font-serif text-sm lowercase tracking-wide text-[#f4eee7] transition hover:bg-[#2f7f95]"
          >
            buy tokens
          </Link>
        </section>

        <nav
          className="mt-12 flex flex-col items-center gap-3 font-serif text-sm lowercase tracking-wide text-[#c6d8e3]"
          aria-label="Profile actions"
        >
          <Link href="/profile/edit" className="hover:text-[#f4eee7]">
            edit profile
          </Link>
          <Link href="/profile/notifications" className="hover:text-[#f4eee7]">
            notifications
          </Link>
          <Link href="/profile/settings" className="hover:text-[#f4eee7]">
            settings
          </Link>
          <Link href="/report" className="text-[#8f7268] hover:text-[#c6d8e3]">
            report an issue
          </Link>
        </nav>

        <div className="mt-10 pb-6">
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-md border border-[#f4eee7]/25 py-3 font-serif text-sm lowercase tracking-wide text-[#f4eee7] transition hover:bg-[#f4eee7]/08"
            >
              sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
