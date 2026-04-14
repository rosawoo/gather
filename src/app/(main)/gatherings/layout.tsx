import { GatheringsTabs } from "@/components/gatherings-tabs";

export default function GatheringsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <GatheringsTabs />
      <div className="px-4">{children}</div>
    </div>
  );
}
