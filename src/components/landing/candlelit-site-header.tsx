import Link from "next/link";
import { GatherWordmarkLink } from "@/components/branding/gather-wordmark-link";
import { lcChrome } from "@/lib/lc-classes";

type Props = {
  sticky?: boolean;
};

/**
 * Gather wordmark is in the center column; `1fr auto 1fr` keeps it
 * optically centered while the about CTA sits in the right column.
 */
export function CandlelitSiteHeader({ sticky = false }: Props) {
  const about = (
    <Link
      href="/about"
      className={
        sticky
          ? "landing-btn-about landing-btn-about--compact lowercase"
          : "landing-btn-about lowercase"
      }
    >
      about
    </Link>
  );

  if (sticky) {
    return (
      <header className={lcChrome.stickyMarketingHeaderBar}>
        <div aria-hidden className="min-w-0" />
        <h1 className="flex justify-center">
          <GatherWordmarkLink href="/" size="landingSticky" />
        </h1>
        <div className="flex min-w-0 justify-end">{about}</div>
      </header>
    );
  }

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
      <div aria-hidden className="min-w-0" />
      <h1 className="flex justify-center">
        <GatherWordmarkLink href="/" size="landingHero" />
      </h1>
      <div className="flex min-w-0 justify-end">{about}</div>
    </header>
  );
}
