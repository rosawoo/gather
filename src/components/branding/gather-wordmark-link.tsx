import Link from "next/link";

export type GatherWordmarkSize =
  /** Full marketing header on `/` — matches non-sticky `CandlelitSiteHeader`. */
  | "landingHero"
  /** Sticky marketing header, app `(main)` header — matches sticky `CandlelitSiteHeader`. */
  | "landingSticky";

const SIZE_CLASSES: Record<GatherWordmarkSize, string> = {
  landingHero: "text-[4.75rem] leading-none sm:text-6xl md:text-7xl",
  landingSticky: "text-[2.85rem] leading-none sm:text-4xl",
};

type Props = {
  href: string;
  size: GatherWordmarkSize;
  /** Extra classes (e.g. `text-center` on a flex child). */
  className?: string;
};

/** Same Berkshire Swash + cream treatment as candlelit landing (`CandlelitSiteHeader`). */
export function GatherWordmarkLink({ href, size, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`landing-font-display font-normal text-lc-cream no-underline ${SIZE_CLASSES[size]} ${className}`.trim()}
    >
      gather
    </Link>
  );
}
