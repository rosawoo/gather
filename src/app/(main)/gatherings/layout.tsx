import { GatheringsTabs } from "@/components/gatherings-tabs";

export default function GatheringsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-4">
      <GatheringsTabs />
      {children}
    </div>
  );
}
