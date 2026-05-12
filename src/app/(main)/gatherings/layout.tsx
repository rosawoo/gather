import { GatheringsTabs } from "@/components/gatherings-tabs";

/** Full-bleed espresso chrome (discover mockup) inside the main column. */
export default function GatheringsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-3 -mt-[calc(env(safe-area-inset-top,0px)+1rem)] sm:-mx-4">
      <div className="min-h-[calc(100dvh-5.5rem-env(safe-area-inset-bottom,0px))] bg-gather-espresso px-3 pb-10 pt-[calc(env(safe-area-inset-top,0px)+1rem)] text-gather-cream sm:px-4">
        <GatheringsTabs />
        {children}
      </div>
    </div>
  );
}
