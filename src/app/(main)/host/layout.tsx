import { SectionHeader } from "@/components/section-header";

export default function HostSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-4">
      <SectionHeader title="Host" />
      {children}
    </div>
  );
}
