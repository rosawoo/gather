import { SectionHeader } from "@/components/section-header";

export default function HostSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SectionHeader title="Host" />
      <div className="px-4">{children}</div>
    </div>
  );
}
