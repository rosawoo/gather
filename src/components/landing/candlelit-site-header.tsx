import Link from "next/link";

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
      <header className="sticky top-0 z-30 -mx-5 mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-[#321308]/40 bg-[#160601]/65 px-5 py-4 backdrop-blur-md sm:-mx-8 sm:px-8 lg:-mx-14 lg:px-14">
        <div aria-hidden className="min-w-0" />
        <h1 className="landing-font-display text-center text-[2.85rem] font-normal leading-none text-[#f4eee7] sm:text-4xl">
          <Link href="/" className="text-inherit no-underline">
            gather
          </Link>
        </h1>
        <div className="flex min-w-0 justify-end">{about}</div>
      </header>
    );
  }

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
      <div aria-hidden className="min-w-0" />
      <h1 className="landing-font-display text-center text-[4.75rem] font-normal leading-none text-[#f4eee7] sm:text-6xl md:text-7xl">
        <Link href="/" className="text-inherit no-underline">
          gather
        </Link>
      </h1>
      <div className="flex min-w-0 justify-end">{about}</div>
    </header>
  );
}
