import { GatheringsTabs } from "@/components/gatherings-tabs";

/** Full-bleed espresso chrome (discover mockup) inside the main column. */
export default function GatheringsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-3 -mt-[calc(env(safe-area-inset-top,0px)+1rem)] sm:-mx-4">
      {/* Inherit candlelit typography + backdrop from (main)/layout */}
      <div className="min-h-[calc(100dvh-5.5rem-env(safe-area-inset-bottom,0px))] px-3 pb-10 pt-[calc(env(safe-area-inset-top,0px)+1rem)] sm:px-4">
        <GatheringsTabs />
        {children}
      </div>
    </div>
  );
}
