import Link from "next/link";
import type { GatheringTeaser } from "@/lib/public-gatherings";

const joinHref = `/sign-up?callbackUrl=${encodeURIComponent("/gatherings")}`;

function formatWhen(d: Date): string {
  return d.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HomeGatheringTeaser({
  gatherings,
}: {
  gatherings: GatheringTeaser[];
}) {
  if (gatherings.length === 0) {
    return (
      <section className="mt-14 border-t border-[#321308]/60 pt-10" aria-labelledby="soon-heading">
        <h2
          id="soon-heading"
          className="landing-font-display text-center text-xl text-[#f4eee7]/95 sm:text-2xl"
        >
          happening soon
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[1.05rem] leading-relaxed text-[#eee9e1]/80">
          hosts are posting gatherings every week. create an account to see the
          full calendar and request a seat at the table.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href={joinHref} className="landing-btn-cta inline-flex max-w-xs justify-center px-8">
            join to discover
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-14 border-t border-[#321308]/60 pt-10" aria-labelledby="soon-heading">
      <h2
        id="soon-heading"
        className="landing-font-display text-center text-xl text-[#f4eee7]/95 sm:text-2xl"
      >
        happening soon
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[#a98974]">
        a peek at what&apos;s on the calendar—sign in for details &amp; requests.
      </p>
      <ul className="mx-auto mt-8 max-w-xl space-y-3">
        {gatherings.map((g) => (
          <li key={g.id}>
            <Link
              href={joinHref}
              className="block rounded-xl border border-[#321308] bg-[rgba(32,11,4,0.55)] px-4 py-3 transition hover:border-[#c6d8e3]/35 hover:bg-[rgba(32,11,4,0.72)]"
            >
              <span className="font-semibold text-[#f4eee7]">{g.title}</span>
              <span className="mt-1 block text-sm text-[#a98974]">
                {g.neighborhood}
                <span aria-hidden> · </span>
                <time dateTime={g.startsAt.toISOString()}>{formatWhen(g.startsAt)}</time>
                {g.tokenCost > 0 ? (
                  <>
                    <span aria-hidden> · </span>
                    {g.tokenCost === 1
                      ? "1 token"
                      : `${g.tokenCost} tokens`}
                  </>
                ) : (
                  <>
                    <span aria-hidden> · </span>
                    free
                  </>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-center text-sm text-[#eee9e1]/75">
        <Link
          href={joinHref}
          className="text-[#c6d8e3] underline decoration-[#c6d8e3]/40 underline-offset-4 hover:decoration-[#c6d8e3]"
        >
          create an account
        </Link>{" "}
        <span className="text-[#a98974]/90">to browse everything</span>
      </p>
    </section>
  );
}
