import Link from "next/link";

type Props = {
  sticky?: boolean;
};

export function CandlelitSiteHeader({ sticky = false }: Props) {
  if (sticky) {
    return (
      <header className="sticky top-0 z-30 -mx-5 mb-2 grid grid-cols-3 items-center gap-2 border-b border-[#321308]/40 bg-[#160601]/65 px-5 py-4 backdrop-blur-md sm:-mx-8 sm:px-8 lg:-mx-14 lg:px-14">
        <p className="text-left text-[0.95rem] tracking-wide text-[#f4eee7]/90">
          washington, d.c.
        </p>
        <h1 className="landing-font-display text-center text-[2.85rem] font-normal leading-none text-[#f4eee7] sm:text-4xl">
          <Link href="/" className="text-inherit no-underline">
            gather
          </Link>
        </h1>
        <div className="flex justify-end">
          <a
            className="landing-btn-about landing-btn-about--compact lowercase"
            href="https://www.gathersocial.us/about"
            target="_blank"
            rel="noopener noreferrer"
          >
            about
          </a>
        </div>
      </header>
    );
  }

  return (
    <header className="grid grid-cols-1 items-center gap-5 sm:grid-cols-3 sm:gap-3">
      <p className="order-2 text-center text-[0.95rem] tracking-wide text-[#f4eee7]/90 sm:order-none sm:text-left">
        washington, d.c.
      </p>
      <h1 className="landing-font-display order-1 text-center text-[4.75rem] font-normal leading-none text-[#f4eee7] sm:order-none sm:text-6xl md:text-7xl">
        <Link href="/" className="text-inherit no-underline">
          gather
        </Link>
      </h1>
      <div className="order-3 flex justify-center sm:justify-end">
        <a
          className="landing-btn-about lowercase"
          href="https://www.gathersocial.us/about"
          target="_blank"
          rel="noopener noreferrer"
        >
          about
        </a>
      </div>
    </header>
  );
}
