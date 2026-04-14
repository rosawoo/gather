"use client";

export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-6 flex rounded-full bg-white/80 p-1 shadow-sm ring-1 ring-neutral-200/80">
      <div className="flex-1 rounded-full bg-gather-brown py-2.5 text-center text-sm font-medium text-gather-cream">
        {title}
      </div>
    </div>
  );
}
