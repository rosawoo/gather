/** Tape + tilt wrapper for polaroid / detail cards (scrapbook look). */
export function ScrapbookFrame({
  children,
  tilt = "sm",
}: {
  children: React.ReactNode;
  tilt?: "sm" | "none";
}) {
  const rot = tilt === "sm" ? "rotate-[0.55deg] hover:rotate-0" : "";
  return (
    <div className="relative w-full px-1 pt-3">
      <div
        aria-hidden
        className="absolute left-1/2 top-0 z-30 h-4 w-[5rem] -translate-x-1/2 rotate-[1.5deg] rounded-[2px] bg-gradient-to-r from-[#f0e6d8]/95 via-white/90 to-[#e8dcc8]/95 shadow-md ring-1 ring-black/15"
      />
      <div className={`relative transition ${rot}`}>{children}</div>
    </div>
  );
}
