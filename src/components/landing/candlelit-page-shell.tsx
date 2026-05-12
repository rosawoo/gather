import { CandlelitSiteHeader } from "@/components/landing/candlelit-site-header";

type Props = {
  children: React.ReactNode;
  headerSticky?: boolean;
  /** Heavier espresso scrim + bottom-focused photo (about / manifesto pages). */
  backdrop?: "default" | "manifesto";
};

/** Shared full-viewport candlelit backdrop + nav (landing, legal, etc.) */
export function CandlelitPageShell({
  children,
  headerSticky = false,
  backdrop = "default",
}: Props) {
  const bgClass =
    backdrop === "manifesto"
      ? "landing-candlelit-bg landing-candlelit-bg--manifesto"
      : "landing-candlelit-bg";

  return (
    <div className="landing-candlelit relative min-h-[100dvh] overflow-x-hidden bg-[#160601]">
      <div className={`${bgClass} fixed inset-0 -z-20 bg-[#160601]`} aria-hidden />
      <div
        className="landing-candlelit-vignette fixed inset-0 -z-10"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-[100dvh] flex-col px-5 pb-14 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] sm:px-8 lg:px-14">
        <CandlelitSiteHeader sticky={headerSticky} />
        {children}
      </div>
    </div>
  );
}
